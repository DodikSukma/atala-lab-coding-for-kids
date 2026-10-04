import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const script = fileURLToPath(import.meta.url);
const stateDir = join(root, ".local-dev");
const services = {
  web: { port: 3000, address: "http://127.0.0.1:3000/belajar/1-1" },
  api: { port: 4000, address: "http://127.0.0.1:4000/health" },
};
const names = Object.keys(services);
const recordPath = (name) => join(stateDir, `${name}.json`);
const logPath = (name) => join(stateDir, `${name}.log`);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function processInfo(pid) {
  try {
    const command = execFileSync(
      "ps",
      ["-ww", "-p", String(pid), "-o", "command="],
      { encoding: "utf8" },
    ).trim();
    const group = Number(
      execFileSync("ps", ["-p", String(pid), "-o", "pgid="], {
        encoding: "utf8",
      }).trim(),
    );
    return { command, group };
  } catch {
    return null;
  }
}

function tracked(name) {
  const path = recordPath(name);
  if (!existsSync(path)) return null;
  let record;
  try {
    record = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    unlinkSync(path);
    return null;
  }
  const info = processInfo(record.pid);
  if (
    !Number.isInteger(record.pid) ||
    record.pid <= 0 ||
    !["dev", "start"].includes(record.mode) ||
    typeof record.token !== "string" ||
    !info ||
    info.group !== record.pid ||
    !info.command.includes(script) ||
    !info.command.includes(`service ${name} ${record.mode} ${record.token}`)
  ) {
    // A stale PID may now belong to another process. Never signal it.
    unlinkSync(path);
    return null;
  }
  return record;
}

function portIsFree(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    server.listen(port, "0.0.0.0", () => server.close(() => resolve(true)));
  });
}

async function ready(name) {
  try {
    const response = await fetch(services[name].address, {
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function stopOne(name) {
  const record = tracked(name);
  if (!record) return false;
  try {
    process.kill(-record.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
  for (let attempt = 0; attempt < 30 && tracked(name); attempt++)
    await pause(100);
  if (tracked(name)) {
    // Recheck the token and process group before escalating.
    process.kill(-record.pid, "SIGKILL");
    for (let attempt = 0; attempt < 20 && tracked(name); attempt++)
      await pause(100);
  }
  if (tracked(name))
    throw new Error(`${name} belum berhenti. Periksa ${logPath(name)}.`);
  console.log(`${name} dihentikan.`);
  return true;
}

async function stop() {
  let stopped = false;
  for (const name of [...names].reverse())
    stopped = (await stopOne(name)) || stopped;
  if (!stopped) console.log("Tidak ada layanan Makefile yang sedang berjalan.");
}

async function status() {
  for (const name of names) {
    const record = tracked(name);
    if (record) {
      console.log(
        `${name}: berjalan (${record.mode}, PID ${record.pid}) — ${services[name].address}`,
      );
    } else if (!(await portIsFree(services[name].port))) {
      console.log(
        `${name}: port ${services[name].port} dipakai proses lain; tidak dikelola Makefile.`,
      );
    } else {
      console.log(`${name}: berhenti.`);
    }
  }
  console.log(`Log: ${stateDir}/{web,api}.log`);
}

async function start(mode) {
  mkdirSync(stateDir, { recursive: true });
  const existing = Object.fromEntries(
    names.map((name) => [name, tracked(name)]),
  );
  for (const name of names) {
    if (existing[name] && existing[name].mode !== mode) {
      throw new Error(
        `${name} sedang berjalan dalam mode ${existing[name].mode}. Jalankan make stop dahulu.`,
      );
    }
    if (!existing[name] && !(await portIsFree(services[name].port))) {
      throw new Error(
        `Port ${services[name].port} sudah dipakai proses lain. Hentikan proses itu sebelum make ${mode}; Makefile tidak akan mematikannya.`,
      );
    }
  }
  const missing = names.filter((name) => !existing[name]);
  if (missing.length === 0) {
    console.log(`Web dan API sudah berjalan dalam mode ${mode}.`);
    await status();
    return;
  }
  if (mode === "start") {
    if (missing.length !== names.length)
      throw new Error(
        "Layanan produksi berjalan sebagian. Jalankan make stop lalu make start.",
      );
    console.log("Membangun web dan API untuk mode produksi…");
    const build = spawn("npm", ["run", "build"], {
      cwd: root,
      stdio: "inherit",
    });
    const code = await new Promise((resolve) => build.on("exit", resolve));
    if (code !== 0) throw new Error("Build gagal; layanan tidak dijalankan.");
  }
  const launched = [];
  try {
    for (const name of missing) {
      const token = randomUUID();
      appendFileSync(
        logPath(name),
        `\n=== ${new Date().toISOString()} · ${mode} ===\n`,
      );
      const log = openSync(logPath(name), "a");
      const child = spawn(
        process.execPath,
        [script, "service", name, mode, token],
        {
          cwd: root,
          detached: true,
          stdio: ["ignore", log, log],
        },
      );
      closeSync(log);
      // The child is a new process-group leader, so stop can target only this service tree.
      child.unref();
      writeFileSync(
        recordPath(name),
        JSON.stringify({ pid: child.pid, token, mode }),
      );
      launched.push(name);
      console.log(`${name} dimulai; log: ${logPath(name)}`);
    }
    for (const name of missing) {
      let healthy = false;
      for (let attempt = 0; attempt < 120; attempt++) {
        if (!tracked(name)) break;
        if (await ready(name)) {
          healthy = true;
          break;
        }
        await pause(100);
      }
      if (!healthy)
        throw new Error(`${name} tidak siap. Periksa ${logPath(name)}.`);
    }
    await status();
  } catch (error) {
    for (const name of launched.reverse()) await stopOne(name);
    throw error;
  }
}

function service(name, mode, token) {
  if (!services[name] || !["dev", "start"].includes(mode) || !token)
    process.exit(2);
  const args =
    mode === "dev"
      ? ["run", `dev:${name}`]
      : ["run", "start", "-w", `@atala/${name}`];
  const child = spawn("npm", args, { cwd: root, stdio: "inherit" });
  child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
}

const [command, name, mode, token] = process.argv.slice(2);
try {
  if (command === "service") service(name, mode, token);
  else if (command === "dev" || command === "start") await start(command);
  else if (command === "stop") await stop();
  else if (command === "status") await status();
  else if (command === "restart") {
    const previous = names.map(tracked).find(Boolean)?.mode || "dev";
    await stop();
    await start(previous);
  } else throw new Error("Perintah: dev, start, stop, status, restart.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
