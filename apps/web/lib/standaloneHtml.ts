import { isProject, type Project } from "./projects";
import type { BlockKind } from "./curriculum";

const labels: Record<BlockKind, string> = {
  start: "Ketika mulai",
  key: "Saat tombol aksi ditekan",
  move: "Maju 1 langkah",
  left: "Putar kiri",
  right: "Putar kanan",
  say: "Ucap pesan",
  wait: "Tunggu sebentar",
  repeat: "Ulangi blok berikut",
  ifStar: "Jika sentuh bintang",
  score: "Tambah skor",
};
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
const safeJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

const KIKO_SVG = `<svg viewBox="0 0 100 100" width="58" height="58" aria-hidden="true"><ellipse cx="50" cy="90" rx="22" ry="6" fill="#38bdf8" opacity=".35"/><line x1="50" y1="22" x2="50" y2="9" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="8" r="6" fill="#facc15"/><rect x="13" y="40" width="9" height="22" rx="4.5" fill="#1d4ed8"/><rect x="78" y="40" width="9" height="22" rx="4.5" fill="#1d4ed8"/><rect x="20" y="22" width="60" height="54" rx="18" fill="#2563eb" stroke="#93c5fd" stroke-width="3"/><rect x="27" y="33" width="46" height="28" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><circle cx="39" cy="45" r="4.8" fill="#38bdf8"/><circle cx="61" cy="45" r="4.8" fill="#38bdf8"/><path d="M43 53Q50 58 57 53" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round" fill="none"/><polygon points="94,50 85,44 85,56" fill="#facc15"/></svg>`;

const KIKI_SVG = `<svg viewBox="0 0 100 100" width="58" height="58" aria-hidden="true"><ellipse cx="50" cy="90" rx="22" ry="6" fill="#fb923c" opacity=".35"/><path d="M22 70C12 66 12 50 20 45" stroke="#ea580c" stroke-width="7" stroke-linecap="round" fill="none"/><polygon points="24,36 22,12 42,24" fill="#f97316" stroke="#fed7aa" stroke-width="2"/><polygon points="76,36 78,12 58,24" fill="#f97316" stroke="#fed7aa" stroke-width="2"/><rect x="21" y="24" width="58" height="52" rx="24" fill="#f97316" stroke="#ffedd5" stroke-width="3"/><ellipse cx="50" cy="54" rx="22" ry="15" fill="#fff7ed"/><circle cx="38" cy="45" r="4.8" fill="#1e293b"/><circle cx="62" cy="45" r="4.8" fill="#1e293b"/><polygon points="50,52 46,48 54,48" fill="#f43f5e"/><path d="M44 55Q47 59 50 55Q53 59 56 55" stroke="#9a3412" stroke-width="2.5" stroke-linecap="round" fill="none"/><rect x="31" y="68" width="38" height="6" rx="3" fill="#2563eb"/><circle cx="50" cy="73" r="5" fill="#facc15"/><polygon points="94,50 85,44 85,56" fill="#facc15"/></svg>`;

export function buildStandaloneHtml(project: Project): string {
  if (!isProject(project)) throw new Error("Proyek belum valid untuk diunduh.");
  const title = project.title.trim().slice(0, 80) || "Karya Atala Lab";
  const scene = {
    backdrop: project.scene?.backdrop === "garden" ? "garden" : "space",
    sprite: project.scene?.sprite === "cat" ? "cat" : "bot",
  };
  const spriteName = scene.sprite === "bot" ? "Kiko" : "Kiki";
  const spriteSvg = scene.sprite === "bot" ? KIKO_SVG : KIKI_SVG;
  const blocks = project.blocks.map((block, index) => ({
    id: String(index),
    kind: block.kind,
    value:
      block.kind === "say"
        ? String(block.value || "Halo, teman!").slice(0, 40)
        : block.kind === "repeat"
          ? Math.max(2, Math.min(12, Number(block.value) || 3))
          : undefined,
  }));
  const data = safeJson({ title, scene, blocks });
  const list = blocks
    .map(
      (block, index) =>
        `<li data-block="${index}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(labels[block.kind])}${block.kind === "say" ? `: ${escapeHtml(String(block.value))}` : ""}</li>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${escapeHtml(title)} — Karya Atala Lab</title>
<style>
:root{font-family:system-ui,-apple-system,Arial,Helvetica,sans-serif;color:#0f172a;background:#f8fafc}*{box-sizing:border-box}body{margin:0}.shell{max-width:1100px;margin:auto;padding:28px 20px 50px}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:24px}.brand{font-weight:900;color:#2563eb;letter-spacing:.06em}.tag{background:#dbeafe;color:#1d4ed8;border-radius:99px;padding:8px 12px;font-size:12px;font-weight:800}.intro h1{font-size:clamp(30px,5vw,52px);letter-spacing:-.05em;margin:0 0 10px}.intro p{color:#475569;margin:0 0 26px;line-height:1.6}.layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(240px,.6fr);gap:20px}.card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 12px 35px #0f172a0b;overflow:hidden}.card-head{padding:18px 20px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;font-weight:800}.card-head small{color:#64748b;font-weight:600}.stage{position:relative;margin:18px;aspect-ratio:1.4;overflow:hidden;border-radius:14px;background:radial-gradient(circle at 65% 25%,#384ca0,#111e49 70%,#0d1735)}.stage.garden{background:linear-gradient(#b7edfb 0 58%,#9de093 58%,#58bb73)}.stage:before{content:"";position:absolute;inset:0;background-image:linear-gradient(#ffffff18 1px,transparent 1px),linear-gradient(90deg,#ffffff18 1px,transparent 1px);background-size:calc(100% / 6) calc(100% / 6)}.planet{position:absolute;right:-35px;top:-35px;width:180px;height:180px;border-radius:50%;background:#6459b4;box-shadow:inset -24px -20px #403c89}.garden .planet{background:#ffe580;box-shadow:0 0 0 12px #ffe58044;width:95px;height:95px;right:30px;top:25px}.star,.sprite{position:absolute;transform:translate(-50%,-50%);transition:left .42s ease,top .42s ease,rotate .42s ease}.star{left:75%;top:58.333%;font-size:44px;color:#facc15;text-shadow:0 4px 13px #0006}.star.caught{filter:drop-shadow(0 0 14px #fff);scale:1.25}.sprite{left:25%;top:58.333%;width:60px;height:60px;display:grid;place-items:center;rotate:0deg}.speech{position:absolute;left:16px;top:14px;background:#fff;border-radius:12px;padding:9px 13px;font-weight:800;max-width:70%;box-shadow:0 5px 16px #0003}.speech:empty{display:none}.info{display:flex;justify-content:space-between;padding:0 20px 18px;font-size:14px;color:#475569}.info strong{color:#2563eb;font-size:22px}.actions{display:flex;flex-wrap:wrap;gap:8px;padding:0 20px 16px}button{border:1px solid #cbd5e1;border-radius:10px;background:#fff;padding:12px 16px;min-height:44px;font-size:14px;font-weight:800;cursor:pointer;color:#1e293b}button:hover{filter:brightness(.96)}button:focus-visible{outline:3px solid #facc15;outline-offset:2px}button.primary{background:#2563eb;color:#fff;border-color:#2563eb}button:disabled{opacity:.5;cursor:default}.status{margin:0;padding:0 20px 20px;color:#334155;min-height:48px;font-weight:700}.program{padding:0 18px 18px;max-height:490px;overflow:auto}.program ol{list-style:none;margin:0;padding:0}.program li{padding:10px 8px;border-bottom:1px solid #edf2f7;font-size:13px;line-height:1.4}.program li span{font-size:11px;color:#94a3b8;font-weight:900;margin-right:10px}.program li.active{background:#dbeafe;border-radius:7px;color:#1d4ed8;font-weight:800}.foot{margin-top:22px;color:#64748b;font-size:12px}@media(max-width:700px){.layout{grid-template-columns:1fr}.shell{padding:20px 12px 35px}.stage{margin:12px}.program{max-height:220px}}@media(prefers-reduced-motion:reduce){.star,.sprite{transition:none}}
</style></head><body><main class="shell"><header class="top"><div class="brand">ATALA LAB</div><span class="tag">Karya codingku</span></header><div class="intro"><h1>${escapeHtml(title)}</h1><p>Tekan tombol di bawah untuk memainkan animasi atau game buatanmu bersama ${spriteName}. Karya ini berjalan mandiri tanpa internet.</p></div><div class="layout"><section class="card" aria-label="Panggung karya"><div class="card-head">Panggung <small>Tokoh: ${spriteName} · Target: raih ${scene.backdrop === "space" ? "bintang" : "bunga"}</small></div><div class="stage ${scene.backdrop}" id="stage"><div class="planet"></div><div class="star" id="star" aria-hidden="true">${scene.backdrop === "space" ? "★" : "✿"}</div><div class="sprite ${scene.sprite}" id="sprite" aria-hidden="true">${spriteSvg}</div><div class="speech" id="speech"></div></div><div class="info"><div>Skor <strong id="score">0</strong></div><div id="position">Posisi 2 : 4</div></div><div class="actions"><button class="primary" id="play">▶ Jalankan</button><button id="action">Tombol aksi</button><button id="reset">↺ Ulang dari awal</button></div><p class="status" id="status" role="status" aria-live="polite">Siap bermain!</p></section><aside class="card"><div class="card-head">Programku <small>${blocks.length} blok</small></div><div class="program"><ol>${list}</ol></div></aside></div><p class="foot">Dibuat dengan Atala Lab · Simpan file ini untuk membagikan karyamu.</p></main>
<script>"use strict";
const PROJECT=${data};
const stage=document.getElementById("stage"), sprite=document.getElementById("sprite"),star=document.getElementById("star"),speech=document.getElementById("speech"),score=document.getElementById("score"),position=document.getElementById("position"),status=document.getElementById("status"),play=document.getElementById("play"),action=document.getElementById("action"),reset=document.getElementById("reset");
const rows=Array.from(document.querySelectorAll("[data-block]"));
let timer=null;let frame={x:1,y:3,direction:0,message:"",score:0,active:"",starCaught:false};
function render(f){frame=f;sprite.style.left=((f.x+.5)/6*100)+"%";sprite.style.top=((f.y+.5)/6*100)+"%";sprite.style.rotate=(f.direction*90)+"deg";speech.textContent=f.message;score.textContent=String(f.score);position.textContent="Posisi "+(f.x+1)+" : "+(f.y+1);star.classList.toggle("caught",f.starCaught);rows.forEach(function(row){row.classList.toggle("active",row.dataset.block===f.active)});}
function resetStage(){if(timer)clearInterval(timer);timer=null;play.disabled=!PROJECT.blocks.some(function(b){return b.kind==="start"});action.disabled=!PROJECT.blocks.some(function(b){return b.kind==="key"});render({x:1,y:3,direction:0,message:"",score:0,active:"",starCaught:false});status.textContent="Siap bermain!";}
function runBlocks(trigger){const blocks=PROJECT.blocks;if(blocks.length>80)throw new Error("Terlalu banyak blok.");const start=blocks.findIndex(function(b){return b.kind===trigger});if(start<0)throw new Error(trigger==="key"?"Tambahkan blok tombol aksi dahulu.":"Tambahkan blok Ketika mulai dahulu.");let state={x:1,y:3,direction:0,message:"",score:0,active:"",starCaught:false},steps=0;const frames=[Object.assign({},state)];function actionBlock(block){steps++;if(steps>500)throw new Error("Program terlalu panjang.");switch(block.kind){case "move":{const dirs=[[1,0],[0,1],[-1,0],[0,-1]],d=dirs[state.direction];state.x=Math.max(0,Math.min(5,state.x+d[0]));state.y=Math.max(0,Math.min(5,state.y+d[1]));break;}case "left":state.direction=(state.direction+3)%4;break;case "right":state.direction=(state.direction+1)%4;break;case "say":state.message=String(block.value||"Halo, teman!").slice(0,40);break;case "score":state.score=Math.min(999,state.score+1);break;}state.starCaught=state.x===4&&state.y===3;state=Object.assign({},state,{active:block.id});frames.push(state);}for(let i=start+1;i<blocks.length;i++){const b=blocks[i];if(b.kind==="start"||b.kind==="key")break;if(b.kind==="repeat"){const next=blocks[i+1];if(next){const count=Math.max(2,Math.min(12,Number(b.value)||3));for(let n=0;n<count;n++)actionBlock(next);i++;}continue;}if(b.kind==="ifStar"){const next=blocks[i+1];if(next){if(state.x===4&&state.y===3)actionBlock(next);i++;}continue;}actionBlock(b);}return frames;}
function startRun(trigger){resetStage();let frames;try{frames=runBlocks(trigger);}catch(error){status.textContent=error.message;return;}play.disabled=true;action.disabled=true;status.textContent="Program berjalan…";let index=0;timer=setInterval(function(){index++;if(index>=frames.length){clearInterval(timer);timer=null;play.disabled=!PROJECT.blocks.some(function(b){return b.kind==="start"});action.disabled=!PROJECT.blocks.some(function(b){return b.kind==="key"});status.textContent=frames.some(function(f){return f.starCaught})?"Hebat! Target berhasil diraih!":"Bagus! Coba mainkan lagi.";return;}render(frames[index]);},500);}
play.disabled=!PROJECT.blocks.some(function(b){return b.kind==="start"});action.disabled=!PROJECT.blocks.some(function(b){return b.kind==="key"});play.addEventListener("click",function(){startRun("start")});action.addEventListener("click",function(){startRun("key")});reset.addEventListener("click",resetStage);if(!play.disabled)startRun("start");else status.textContent="Tekan Tombol aksi untuk memainkan game-mu!";
</script></body></html>`;
}

export function downloadStandaloneHtml(project: Project): void {
  const html = buildStandaloneHtml(project);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `atala-karya-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "proyek"}.html`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
