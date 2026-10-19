import Memory from "./memory";

type Instruction = {
  opcode: number;
};

export default class Hart {
  memory: Memory;
  registers: ArrayBuffer;
  programCounter: bigint;

  constructor(memorySize: bigint) {
    this.memory = new Memory(memorySize);
    this.registers = new ArrayBuffer(4 * 32);
    this.programCounter = BigInt(0);
  }

  loadBinary(binary: ArrayBuffer, address: bigint) {
    this.memory.loadBinary(binary, address);
  }

  fetchInstruction() {
    const instruction = this.memory.load32(this.programCounter);
    this.programCounter += BigInt(4);
    return instruction;
  }

  decodeInstruction(instruction: number): Instruction {
    const opcode = instruction & 0x7f; // Bits [6:0]
    return {
      opcode: opcode,
    };
  }

  executeInstruction(instruction: Instruction) {
    console.log(instruction);
  }

  step() {
    const instruction = this.fetchInstruction();
    const decodedInstruction = this.decodeInstruction(instruction);
    this.executeInstruction(decodedInstruction);
  }

  runCycles(maxCycles: bigint) {
    let cycles = BigInt(0);

    while (cycles < maxCycles) {
      this.step();
      cycles++;
    }
  }
}
