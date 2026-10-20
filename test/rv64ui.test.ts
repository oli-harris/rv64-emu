import { readdirSync, readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { runTest } from "./run";
import loadElf from "../src/loader/loadElf";

const testDir = "test/riscv/rv64ui";

const testElfs = readdirSync(testDir).filter((file) => file.endsWith(".elf"));

function readElfFile(fileName: string): ArrayBuffer {
  const filePath = `${testDir}/${fileName}`;
  const fileBuffer = readFileSync(filePath);
  return fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
}

describe("rv64ui", () => {
  it.each(testElfs)("%s", (name) => {
    const elfBuffer = readElfFile(name);
    const elf = loadElf(elfBuffer);
    const result = runTest(elf.data, Number(elf.entry), 100n);
    expect(result).toBe(1);
  });
});
