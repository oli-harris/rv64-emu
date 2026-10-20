import Hart from "../src/emulator/hart";
import Memory from "../src/emulator/memory";

const memoryBase = 0x80000000;

export function runTest(binary: ArrayBuffer, entry: number, maxCycles: bigint) {
  const memory = new Memory(1 << 20, memoryBase); // 1 MiB of memory
  const hart = new Hart(memory, entry);
  memory.loadBinary(binary, memoryBase);
  hart.runCycles(maxCycles);
}
