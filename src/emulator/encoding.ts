export type DecodedInstruction = {
  instruction: number;
  rd: number | null;
  rs1: number | null;
  rs2: number | null;
  imm: number | null;
};
