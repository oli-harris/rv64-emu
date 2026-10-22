import { readdirSync } from "fs";
import { describe, expect, it } from "vitest";
import { readElfFile, runTest } from "./run";
import loadElf from "../src/loader/loadElf";

const testDir = "test/riscv/rv64ui/";
const testElfs = readdirSync(testDir).filter((file) => file.endsWith(".elf"));

describe("rv64ui", () => {
  it.each(testElfs)("%s", (name) => {
    const elf = loadElf(readElfFile(testDir + name));
    expect(runTest(elf)).toBe(1n);
  });
});
