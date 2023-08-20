import { beforeAll, afterAll, expect, test } from "@jest/globals";
import * as fs from "fs";
import { withify, withifySync } from "./with.js";

afterAll(async () => {
  await fs.promises.unlink("test.txt");
});

test("withifySync", () => {
  const queue: string[] = [];
  const withified = withifySync(
    (args) => {
      queue.push("open");
      queue.push(args);
      return args;
    },
    (context) => {
      queue.push("close");
    }
  );
  withified(["test.txt", "w"], (context) => {
    queue.push("write");
    queue.push(context);
  });
  expect(queue).toEqual([
    "open",
    ["test.txt", "w"],
    "write",
    ["test.txt", "w"],
    "close",
  ]);
});

test("withify", async () => {
  const queue: string[] = [];
  const withified = withify(
    async (args) => {
      queue.push("open");
      queue.push(args);
      return args;
    },
    async (context) => {
      queue.push("close");
    }
  );
  await withified(["test.txt", "w"], async (context) => {
    queue.push("write");
    queue.push(context);
  });
  expect(queue).toEqual([
    "open",
    ["test.txt", "w"],
    "write",
    ["test.txt", "w"],
    "close",
  ]);
});

test("withifySync fs", () => {
  const queue: string[] = [];
  const withified = withifySync(
    (args) => {
      queue.push("open");
      queue.push(args);
      return fs.openSync(args[0], args[1]);
    },
    (context) => {
      queue.push("close");
      fs.closeSync(context);
    }
  );
  withified(["test.txt", "w"], (context) => {
    queue.push("write");
    queue.push(context);
  });
  expect(queue).toEqual([
    "open",
    ["test.txt", "w"],
    "write",
    expect.any(Number),
    "close",
  ]);
});

test("withify fs", async () => {
  const queue: string[] = [];
  const withified = withify(
    async (args) => {
      queue.push("open");
      queue.push(args);
      return await fs.promises.open(args[0], args[1]);
    },
    async (context) => {
      queue.push("close");
      await context.close();
    }
  );
  await withified(["test.txt", "w"], async (context) => {
    queue.push("write");
    queue.push(context);
  });
  expect(queue).toEqual([
    "open",
    ["test.txt", "w"],
    "write",
    expect.any(Object),
    "close",
  ]);
});
