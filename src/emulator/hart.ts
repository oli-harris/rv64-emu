import type { DecodedInstruction } from "./encoding";
import type { Extension } from "./extensions/extension";
import RV64i from "./extensions/rv64i";
import type Memory from "./memory";

export default class Hart {
  memory: Memory;
  registers: ArrayBuffer;
  programCounter: number;
  extensions: Extension[] = [new RV64i()];

  constructor(memory: Memory, entry: number = 0) {
    this.memory = memory;
    this.registers = new ArrayBuffer(8 * 32);
    this.programCounter = entry;
  }

  setRegister(index: number, value: bigint) {
    if (index === 0) return; // x0 is always zero
    const view = new DataView(this.registers);
    view.setBigUint64(index * 8, value, true);
  }

  getRegister(index: number): bigint {
    const view = new DataView(this.registers);
    return view.getBigUint64(index * 8, true);
  }

  fetchInstruction() {
    const instruction = this.memory.load32(this.programCounter);
    this.programCounter += 4;
    return instruction;
  }

  decodeInstruction(instruction: number): DecodedInstruction | null {
    for (const extension of this.extensions) {
      const decoded = extension.decode(instruction);
      if (decoded) {
        return decoded;
      }
    }
    return null;
  }

  executeInstruction(decodedInstruction: DecodedInstruction) {
    console.log(decodedInstruction);
  }

  step() {
    const instruction = this.fetchInstruction();
    const decodedInstruction = this.decodeInstruction(instruction);
    if (decodedInstruction) {
      this.executeInstruction(decodedInstruction);
    } else {
      throw new Error(`Unknown instruction: 0x${instruction.toString(16)}`);
    }
  }

  runCycles(maxCycles: bigint) {
    let cycles = BigInt(0);

    while (cycles < maxCycles) {
      this.step();
      cycles++;
    }
  }
}
