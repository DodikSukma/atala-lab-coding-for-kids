import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createRemixFromTemplate,
  isValidProjectTemplate,
  projectTemplates,
  templateToProject,
} from "../lib/templates";
import {
  duplicateProject,
  isProject,
  parseImportedProjectJson,
  type Project,
} from "../lib/projects";
import { runBlocks } from "../lib/runtime";
import { buildStandaloneHtml } from "../lib/standaloneHtml";

test("all 6 project templates are valid, playable in runtime, and exportable to HTML", () => {
  assert.ok(projectTemplates.length >= 6);
  const expectedTitles = [
    "Kiko Menuju Bintang",
    "Tarian Kiki",
    "Pesan dari Planet Atala",
    "Roket Berulang",
    "Tangkap Bintang",
    "Taman Bunga Kiki",
  ];
  for (const title of expectedTitles) {
    assert.ok(
      projectTemplates.some((t) => t.title === title),
      `Missing template: ${title}`,
    );
  }

  for (const tpl of projectTemplates) {
    assert.equal(isValidProjectTemplate(tpl), true);
    const asProj = templateToProject(tpl);
    assert.equal(isProject(asProj), true);

    const trigger = tpl.blocks.some((b) => b.kind === "start")
      ? "start"
      : "key";
    const frames = runBlocks(tpl.blocks, trigger);
    assert.ok(frames.length > 1, `Template ${tpl.id} produced no action frames`);

    const html = buildStandaloneHtml(asProj);
    assert.match(html, /<!doctype html>/i);
    assert.doesNotMatch(html, /https?:\/\//i);
  }
});

test("remix creates a new project ID and never mutates template or existing projects", () => {
  const existing: Project[] = [
    {
      id: "existing-1",
      title: "Remix: Kiko Menuju Bintang",
      lessonId: "1-1",
      blocks: [{ id: "b1", kind: "start" }],
      updatedAt: "2026-10-01T00:00:00Z",
    },
  ];

  const originalTemplate = projectTemplates[0];
  const originalBlockIds = originalTemplate.blocks.map((b) => b.id);

  const remixed = createRemixFromTemplate(originalTemplate.id, existing);
  assert.notEqual(remixed.id, originalTemplate.id);
  assert.notEqual(remixed.id, existing[0].id);
  assert.equal(remixed.remixedFromId, originalTemplate.id);
  assert.equal(remixed.title, "Remix: Kiko Menuju Bintang (2)");

  for (let i = 0; i < remixed.blocks.length; i++) {
    assert.notEqual(remixed.blocks[i].id, originalBlockIds[i]);
  }

  const dup = duplicateProject(remixed, [...existing, remixed]);
  assert.notEqual(dup.id, remixed.id);
  assert.equal(dup.remixedFromId, remixed.id);

  const payload = JSON.stringify({
    format: "atala-lab-project",
    version: 1,
    project: remixed,
  });
  const imported = parseImportedProjectJson(payload);
  assert.equal(isProject(imported), true);
  assert.notEqual(imported.id, remixed.id);
  assert.equal(imported.title, remixed.title);
  assert.equal(imported.blocks.length, remixed.blocks.length);
});
