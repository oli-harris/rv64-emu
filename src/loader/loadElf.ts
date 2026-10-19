export type ELFHeader = {
  endian: number;
  machine: number;
  type: number;
  entry: bigint;
  phoff: bigint;
  phentsize: number;
  phnum: number;
};

export type ELF = {
  entry: bigint;
  data: ArrayBuffer;
};

const ELF_MAGIC = [0x7f, 0x45, 0x4c, 0x46];
const ELF64_HEADER_SIZE = 64;
const ELFCLASS64 = 2;
const ELFDATA2LSB = 1;
const ET_EXEC = 2;
const EM_RISCV = 0xf3;

export function isElfFile(bytes: Uint8Array): boolean {
  if (bytes.length < ELF_MAGIC.length) {
    return false;
  }

  return ELF_MAGIC.every((value, index) => bytes[index] === value);
}

export function isElf64(bytes: Uint8Array): boolean {
  return bytes[4] === ELFCLASS64;
}

export function isLittleEndian(bytes: Uint8Array): boolean {
  return bytes[5] === ELFDATA2LSB;
}

// Assumes the caller has already checked magic, class and endianness.
export function parseElfHeader(bytes: Uint8Array): ELFHeader {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  return {
    endian: bytes[5],
    type: view.getUint16(16, true),
    machine: view.getUint16(18, true),
    entry: view.getBigUint64(24, true),
    phoff: view.getBigUint64(32, true),
    phentsize: view.getUint16(54, true),
    phnum: view.getUint16(56, true),
  };
}

export default function loadElf(file: ArrayBuffer): ELF {
  const bytes = new Uint8Array(file);

  if (!isElfFile(bytes)) {
    throw new Error("File is not an ELF file.");
  }

  if (bytes.length < ELF64_HEADER_SIZE) {
    throw new Error("File is too small to contain an ELF64 header.");
  }

  if (!isElf64(bytes)) {
    throw new Error("Only 64-bit ELF files are supported.");
  }

  if (!isLittleEndian(bytes)) {
    throw new Error("Only little-endian ELF files are supported.");
  }

  const header = parseElfHeader(bytes);

  if (header.machine !== EM_RISCV) {
    throw new Error(`Unsupported machine type: ${header.machine}`);
  }

  if (header.type !== ET_EXEC) {
    throw new Error(`Unsupported ELF type: ${header.type}`);
  }

  const start = Number(header.phoff);
  const end = start + header.phentsize * header.phnum;

  if (end > file.byteLength) {
    throw new Error("Program header table extends past end of file.");
  }

  return {
    entry: header.entry,
    data: file.slice(start, end),
  };
}
