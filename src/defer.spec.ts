import { expect, test } from "@jest/globals";
import { deferBlock, deferBlockSync } from "./defer.js";

test("deferBlockSync", () => {
  const queue: string[] = [];
  const result = deferBlockSync((defer) => {
    defer(() => queue.push("first"));
    defer(() => queue.push("second"));
    return "result";
  });
  expect(result).toBe("result");
  expect(queue).toEqual(["second", "first"]);
});

test("deferBlock", async () => {
  const queue: string[] = [];
  const result = await deferBlock(async (defer) => {
    defer(() => {
      queue.push("first");
    });
    defer(() => {
      queue.push("second");
    });
    return "result";
  });
  expect(result).toBe("result");
  expect(queue).toEqual(["second", "first"]);
});
