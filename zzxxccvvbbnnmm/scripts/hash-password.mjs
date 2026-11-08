import argon2 from "argon2";
import { emitKeypressEvents } from "node:readline";

if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
  console.error("Run this script in an interactive terminal.");
  process.exit(1);
}

emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdout.write("Enter a password (input hidden), then press Enter: ");

let password = "";
const finish = async () => {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  process.stdout.write("\n");
  if (password.length < 12 || password.length > 256) {
    console.error("Use a password between 12 and 256 characters.");
    process.exit(1);
  }
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    });
    password = "";
    console.log(hash);
  } catch {
    password = "";
    console.error("Could not generate the password hash.");
    process.exitCode = 1;
  }
};

process.stdin.on("keypress", (character, key) => {
  if (key?.ctrl && key.name === "c") {
    process.stdin.setRawMode(false);
    process.exit(130);
  }
  if (key?.name === "return") {
    void finish();
    return;
  }
  if (key?.name === "backspace") {
    password = password.slice(0, -1);
    return;
  }
  if (character && !key?.ctrl && !key?.meta && password.length < 256) {
    password += character;
  }
});
