import { test } from "node:test";
import { strict as assert } from "node:assert";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ProjectDto } from "../src/routes";
test("project payload rejects unknown lesson", async () => {
  const dto = plainToInstance(ProjectDto, {
    id: "14d1d8dc-783c-45fa-a376-27fcce03e690",
    title: "Uji",
    lessonId: "6-1",
    blocks: [],
  });
  assert.ok((await validate(dto)).length > 0);
});

test("starter blocks without values are valid", async () => {
  const dto = plainToInstance(ProjectDto, {
    id: "14d1d8dc-783c-45fa-a376-27fcce03e690",
    title: "Uji",
    lessonId: "1-1",
    blocks: [{ id: "b27775ce-c3e1-4b90-a823-6f574c2605f6", kind: "start" }],
  });
  assert.equal((await validate(dto)).length, 0);
});
