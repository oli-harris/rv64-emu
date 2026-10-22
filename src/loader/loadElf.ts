export type ELFHeader = {
  endian: number;
  machine: number;
  type: number;
  entry: bigint;
  phoff: bigint;
  phentsize: number;
  phnum: number;
};

export type Segment = {
  vaddr: bigint;
  data: ArrayBuffer;
};

export type ELF = {
  entry: bigint;
  segments: Segment[];
};

export type ProgramHeader = {
  type: number;
  flags: number;
  fileOffset: bigint;
  vaddr: bigint;
  paddr: bigint;
  fileSize: bigint;
  memSize: bigint;
  align: bigint;
};

const ELF_MAGIC = [0x7f, 0x45, 0x4c, 0x46];
const ELF64_HEADER_SIZE = 64;
const ELFCLASS64 = 2;
const ELFDATA2LSB = 1;
const ET_EXEC = 2;
const EM_RISCV = 0xf3;
const PT_LOAD = 1;

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

export function parseProgramHeaders(
  bytes: Uint8Array,
  phoff: bigint,
  phentsize: number,
  phnum: number
): ProgramHeader[] {
  const programHeaders = bytes.buffer.slice(Number(phoff), Number(phoff) + phentsize * phnum);
  const view = new DataView(programHeaders, 0, programHeaders.byteLength);

  const headers: ProgramHeader[] = [];

  for (let i = 0; i < phnum; i++) {
    const offset = i * phentsize;

    headers.push({
      type: view.getUint32(offset, true),
      flags: view.getUint32(offset + 4, true),
      fileOffset: view.getBigUint64(offset + 8, true),
      vaddr: view.getBigUint64(offset + 16, true),
      paddr: view.getBigUint64(offset + 24, true),
      fileSize: view.getBigUint64(offset + 32, true),
      memSize: view.getBigUint64(offset + 40, true),
      align: view.getBigUint64(offset + 48, true),
    });
  }

  return headers;
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

  const programHeaders = parseProgramHeaders(bytes, header.phoff, header.phentsize, header.phnum);
  const segments: Segment[] = [];

  for (const programHeader of programHeaders) {
    if (programHeader.type === PT_LOAD) {
      const segmentData = file.slice(
        Number(programHeader.fileOffset),
        Number(programHeader.fileOffset + programHeader.fileSize)
      );
      segments.push({
        vaddr: programHeader.vaddr,
        data: segmentData,
      });
    }
  }

  if (segments.length === 0) {
    throw new Error("ELF file does not contain any loadable segments.");
  }

  return {
    entry: header.entry,
    segments: segments,
  };
}
