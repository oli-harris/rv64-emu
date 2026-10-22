import { readFileSync } from "node:fs";
import Hart from "../src/emulator/hart";
import Memory from "../src/emulator/memory";
import { type ELF } from "../src/loader/loadElf";

const memoryBase = 0x80000000;
const memorySize = 1 << 20; // 1 MiB
const batchCycles = 256n;
const maxBatches = 1000;

export function readElfFile(fileName: string): ArrayBuffer {
  const fileBuffer = readFileSync(fileName);
  return fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
}

export function runTest(elf: ELF): bigint {
  const memory = new Memory(memorySize, memoryBase);
  for (const segment of elf.segments) {
    memory.loadBinary(segment.data, Number(segment.vaddr));
  }
  const hart = new Hart(memory, Number(elf.entry));

  // Run test program, checking the test result after each batch of cycles.
  for (let i = 0; i < maxBatches; i++) {
    hart.runCycles(batchCycles);
  }
  throw new Error(`Test failed to halt after ${(BigInt(maxBatches) * batchCycles).toLocaleString()} cycles`);
}
