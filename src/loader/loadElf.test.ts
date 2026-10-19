import { describe, expect, it } from "vitest";
import loadElf, {
  isElf64,
  isElfFile,
  isLittleEndian,
  parseElfHeader,
} from "./loadElf";

const VALID_ELF = {
  magic: [0x7f, 0x45, 0x4c, 0x46],
  elfClass: 2,
  endian: 1,
  type: 2,
  machine: 0xf3,
  entry: 0x80000000n,
  phoff: 64n,
  phentsize: 56,
  phnum: 1,
  size: 64 + 56,
};

// Build a valid ELF 64 file
function makeElf(options: Partial<typeof VALID_ELF> = {}): ArrayBuffer {
  const {
    magic = VALID_ELF.magic,
    elfClass = VALID_ELF.elfClass,
    endian = VALID_ELF.endian,
    type = VALID_ELF.type,
    machine = VALID_ELF.machine,
    entry = VALID_ELF.entry,
    phoff = VALID_ELF.phoff,
    phentsize = VALID_ELF.phentsize,
    phnum = VALID_ELF.phnum,
    size = VALID_ELF.size,
  } = options;

  const buffer = new ArrayBuffer(size);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  bytes.set(magic, 0);
  bytes[4] = elfClass;
  bytes[5] = endian;
  view.setUint16(16, type, true);
  view.setUint16(18, machine, true);
  view.setBigUint64(24, entry, true);
  view.setBigUint64(32, phoff, true);
  view.setUint16(54, phentsize, true);
  view.setUint16(56, phnum, true);

  return buffer;
}

describe("isElfFile", () => {
  it("accepts the ELF magic", () => {
    expect(isElfFile(new Uint8Array(makeElf()))).toBe(true);
  });

  it("rejects a wrong magic", () => {
    expect(
      isElfFile(new Uint8Array(makeElf({ magic: [0, 0x45, 0x4c, 0x46] }))),
    ).toBe(false);
    expect(
      isElfFile(new Uint8Array(makeElf({ magic: [0x7f, 0x45, 0x4c, 0x47] }))),
    ).toBe(false);
  });

  it("rejects input shorter than the magic", () => {
    expect(isElfFile(new Uint8Array([0x7f, 0x45]))).toBe(false);
  });
});

describe("isElf64", () => {
  it("detects 64-bit ELF files", () => {
    expect(isElf64(new Uint8Array(makeElf()))).toBe(true);
  });

  it("rejects 32-bit ELF files", () => {
    expect(isElf64(new Uint8Array(makeElf({ elfClass: 1 })))).toBe(false);
  });
});

describe("isLittleEndian", () => {
  it("detects little-endian ELF files", () => {
    expect(isLittleEndian(new Uint8Array(makeElf()))).toBe(true);
  });

  it("rejects big-endian ELF files", () => {
    expect(isLittleEndian(new Uint8Array(makeElf({ endian: 2 })))).toBe(false);
  });
});

describe("parseElfHeader", () => {
  it("reads fields correctly", () => {
    const elf = makeElf();
    const header = parseElfHeader(new Uint8Array(elf));

    expect(header).toEqual({
      endian: VALID_ELF.endian,
      type: VALID_ELF.type,
      machine: VALID_ELF.machine,
      entry: VALID_ELF.entry,
      phoff: VALID_ELF.phoff,
      phentsize: VALID_ELF.phentsize,
      phnum: VALID_ELF.phnum,
    });
  });
});

describe("loadElf", () => {
  it("returns the entry point and program header data", () => {
    const elf = loadElf(
      makeElf({ entry: 0x80000000n, phnum: 2, size: 64 + 112 }),
    );

    expect(elf.entry).toBe(0x80000000n);
    expect(elf.data.byteLength).toBe(56 * 2);
  });

  it("throws for wrong magic number", () => {
    expect(() => loadElf(makeElf({ magic: [0, 0, 0, 0] }))).toThrow(
      /not an ELF/,
    );
  });

  it("throws for a file too small for a header", () => {
    const small = makeElf().slice(0, 32);
    expect(() => loadElf(small)).toThrow(/too small/);
  });

  it("throws for 32-bit ELF", () => {
    expect(() => loadElf(makeElf({ elfClass: 1 }))).toThrow(/64-bit/);
  });

  it("throws for big-endian ELF", () => {
    expect(() => loadElf(makeElf({ endian: 2 }))).toThrow(/little-endian/);
  });

  it("throws for a non-RISC-V machine", () => {
    expect(() => loadElf(makeElf({ machine: 0x3e }))).toThrow(/machine/);
  });

  it("throws for a non-executable ELF type", () => {
    expect(() => loadElf(makeElf({ type: 1 }))).toThrow(/ELF type/);
  });

  it("throws for a program header table past the end of the file", () => {
    expect(() => loadElf(makeElf({ phnum: 10 }))).toThrow(/past end/);
  });
});
