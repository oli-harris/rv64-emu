import type { DecodedInstruction } from "../../encoding";
import { RV64i } from "./instructions";

export function execute(decodedInstruction: DecodedInstruction): void {
  switch (decodedInstruction.instruction) {
    case RV64i.LUI:
      break;
    case RV64i.AUIPC:
      break;
    case RV64i.JAL:
      break;
    case RV64i.JALR:
      break;
    case RV64i.BEQ:
      break;
    case RV64i.BNE:
      break;
    case RV64i.BLT:
      break;
    case RV64i.BGE:
      break;
    case RV64i.BLTU:
      break;
    case RV64i.BGEU:
      break;
    case RV64i.LB:
      break;
    case RV64i.LH:
      break;
    case RV64i.LW:
      break;
    case RV64i.LBU:
      break;
    case RV64i.LHU:
      break;
    case RV64i.SB:
      break;
    case RV64i.SH:
      break;
    case RV64i.SW:
      break;
    case RV64i.ADDI:
      break;
    case RV64i.SLTI:
      break;
    case RV64i.SLTIU:
      break;
    case RV64i.XORI:
      break;
    case RV64i.ORI:
      break;
    case RV64i.ANDI:
      break;
    case RV64i.SLLI:
      break;
    case RV64i.SRLI:
      break;
    case RV64i.SRAI:
      break;
    case RV64i.ADD:
      break;
    case RV64i.SUB:
      break;
    case RV64i.SLL:
      break;
    case RV64i.SLT:
      break;
    case RV64i.SLTU:
      break;
    case RV64i.XOR:
      break;
    case RV64i.SRL:
      break;
    case RV64i.SRA:
      break;
    case RV64i.OR:
      break;
    case RV64i.AND:
      break;
    case RV64i.FENCE:
      break;
    case RV64i.FENCE_ISO:
      break;
    case RV64i.PAUSE:
      break;
    case RV64i.ECALL:
      break;
    case RV64i.EBREAK:
      break;
    default:
      throw new Error(`Unknown instruction: ${decodedInstruction.instruction}`);
  }
}
