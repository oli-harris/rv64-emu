import type { DecodedInstruction } from "../../encoding";

export function decode(instruction: number): DecodedInstruction | null {
  // Split instruction
  const opcode = instruction & 0x7f; // [6:0]
  const rd = (instruction >> 7) & 0x1f; // [11:7]
  const rs1 = (instruction >> 15) & 0x1f; // [19:15]
  const rs2 = (instruction >> 20) & 0x1f; // [24:20]
  const func3 = (instruction >> 12) & 0x7; // [14:12]
  const func7 = (instruction >> 25) & 0x7f; // [31:25]

  switch (opcode) {
    case 0b01_101_11: // LUI
      break;
    case 0b00_101_11: // AUIPC
      break;
    case 0b11_011_11: // JAL
      break;
    case 0b11_001_11: // JALR
      break;
    case 0b11_000_11: // BRANCH
      break;
    case 0b00_000_11: // LOAD
      break;
    case 0b01_000_11: // STORE
      break;
    case 0b00_100_11: // OP-IMM
      break;
    case 0b01_100_11: // OP
      break;
    case 0b00_011_11: // MISC-MEM
      break;
    case 0b11_100_11: // SYSTEM
      break;
    default:
      return null;
  }

  return null;
}
