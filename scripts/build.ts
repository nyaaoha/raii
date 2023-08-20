import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

await Promise.all([
  fs.promises.rm("dist", { recursive: true, force: true }),
  fs.promises.rm("dist-temp", { recursive: true, force: true }),
]);
await Promise.all([
  execAsync("tsc --project tsconfig.cjs.json"),
  execAsync("tsc --project tsconfig.esm.json"),
  execAsync("tsc --project tsconfig.types.json"),
]);
