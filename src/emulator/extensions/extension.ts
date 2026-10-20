import type { DecodedInstruction } from "../encoding";
import type Hart from "../hart";

export interface Extension {
  name: string;
  instruction: Record<string, number>;
  decode(instruction: number): DecodedInstruction | null;
  execute(decodedInstruction: DecodedInstruction, hart: Hart): void;
}
