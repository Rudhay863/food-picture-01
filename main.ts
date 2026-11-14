// food-picture-01 entry: copy the prepared food picture to the output dir.
// Runs on Node 22, standard library only. Deterministic: both runs write
// the same bytes, because the file is copied byte for byte.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const SOURCE = resolve(import.meta.dirname, "entry.png");
const DEST = join(OUTPUT_DIR, "entry.png");

if (!existsSync(SOURCE)) {
  console.error(`missing source image: ${SOURCE}`);
  process.exit(1);
}

// Size/format guard: the competition caps the picture at 1 MiB and
// 1024x1024 px, and it must be a whole PNG (magic bytes 89 50 4E 47).
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const sourceBytes = readFileSync(SOURCE);
if (sourceBytes.length > 1048576) {
  console.error(`source image too large: ${sourceBytes.length} bytes (max 1048576)`);
  process.exit(1);
}
if (!sourceBytes.subarray(0, 8).equals(PNG_MAGIC)) {
  console.error("source image is not a PNG");
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(SOURCE, DEST);

// Verify the copy byte for byte before exiting.
const destBytes = readFileSync(DEST);
if (!sourceBytes.equals(destBytes)) {
  console.error("copy verification failed: output differs from source");
  process.exit(1);
}

console.log(`wrote ${DEST} (${destBytes.length} bytes)`);
