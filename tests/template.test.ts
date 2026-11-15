import { test } from "node:test";
import assert from "node:assert/strict";
import { fillTemplate, type Template } from "../registry/lib/template.ts";

test("fillTemplate swaps every slot, hyphenated names included, and keeps the copy around them", () => {
  const copy: Template<"terms-link" | "privacy"> = "See the {terms-link} and {privacy}.";
  assert.deepEqual(fillTemplate(copy, { "terms-link": "Terms", privacy: "Privacy" }), [
    "See the ",
    "Terms",
    " and ",
    "Privacy",
    ".",
  ]);
});

test("fillTemplate throws for a slot the caller does not fill", () => {
  const copy = "Hi {name}" as Template<"name">;
  assert.throws(() => fillTemplate(copy, {} as Record<"name", string>), /no value for \{name\}/);
});
