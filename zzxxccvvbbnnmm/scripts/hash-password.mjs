import { argon2id } from "hash-wasm";
import { randomBytes } from "node:crypto";

if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
  console.error("Run this script in an interactive terminal.");
  process.exit(1);
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdout.write("Enter a password (input hidden), then press Enter: ");

let password = "";
let finished = false;
process.stdin.on("data", async (chunk) => {
  if (finished) return;
  for (const character of chunk.toString("utf8")) {
    if (character === "\u0003") {
      process.stdin.setRawMode(false);
      process.exit(130);
    }
    if (character === "\r" || character === "\n") {
      finished = true;
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      if (password.length < 12 || password.length > 256) {
        console.error("Use a password between 12 and 256 characters.");
        process.exit(1);
      }
      try {
        const hash = await argon2id({
          password,
          salt: randomBytes(16),
          parallelism: 1,
          iterations: 2,
          memorySize: 19456,
          hashLength: 32,
          outputType: "encoded"
        });
        password = "";
        console.log(hash);
      } catch {
        password = "";
        console.error("Could not generate the password hash.");
        process.exitCode = 1;
      }
      return;
    }
    if (character === "\u007f" || character === "\b") {
      password = password.slice(0, -1);
    } else if (character >= " " && password.length < 256) {
      password += character;
    }
  }
});
