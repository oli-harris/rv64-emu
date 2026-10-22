export type ELFHeader = {
  endian: number;
  machine: number;
  type: number;
  entry: bigint;
  phoff: bigint;
  phentsize: number;
  phnum: number;
  shoff: bigint;
  shentsize: number;
  shnum: number;
  shstrndx: number;
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

export type SectionHeader = {
  name: number;
  type: number;
  flags: bigint;
  addr: bigint;
  offset: bigint;
  size: bigint;
  link: number;
  info: number;
  addralign: bigint;
  entsize: bigint;
};

export type Segment = {
  vaddr: bigint;
  data: ArrayBuffer;
};

export type StringMap = Map<number, string>; // offset -> string
export type SymbolMap = Map<string, bigint>; // name -> address

export type ELF = {
  entry: bigint;
  segments: Segment[];
  symbols: SymbolMap;
};

const ELF_MAGIC = [0x7f, 0x45, 0x4c, 0x46];
const ELF64_HEADER_SIZE = 64;
const ELFCLASS64 = 2;
const ELFDATA2LSB = 1;
const ET_EXEC = 2;
const EM_RISCV = 0xf3;
const PT_LOAD = 1;
const SHT_SYMTAB = 2;

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
    shoff: view.getBigUint64(40, true),
    shentsize: view.getUint16(58, true),
    shnum: view.getUint16(60, true),
    shstrndx: view.getUint16(62, true),
  };
}

export function parseProgramHeaders(
  bytes: Uint8Array,
  phoff: bigint,
  phentsize: number,
  phnum: number
): ProgramHeader[] {
  const programHeaders = bytes.buffer.slice(Number(phoff), bytes.byteOffset + Number(phoff) + phentsize * phnum);
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

export function parseSectionHeaders(bytes: Uint8Array, shoff: bigint, shentsize: number, shnum: number) {
  const sectionHeaders = bytes.buffer.slice(Number(shoff), bytes.byteOffset + Number(shoff) + shentsize * shnum);
  const view = new DataView(sectionHeaders, 0, sectionHeaders.byteLength);

  const headers: SectionHeader[] = [];
  for (let i = 0; i < shnum; i++) {
    const offset = i * shentsize;

    headers.push({
      name: view.getUint32(offset, true),
      type: view.getUint32(offset + 4, true),
      flags: view.getBigUint64(offset + 8, true),
      addr: view.getBigUint64(offset + 16, true),
      offset: view.getBigUint64(offset + 24, true),
      size: view.getBigUint64(offset + 32, true),
      link: view.getUint32(offset + 40, true),
      info: view.getUint32(offset + 44, true),
      addralign: view.getBigUint64(offset + 48, true),
      entsize: view.getBigUint64(offset + 56, true),
    });
  }

  return headers;
}

export function readNullTerminatedString(bytes: Uint8Array, offset: number): string {
  const charArray = new Uint8Array(bytes.buffer, bytes.byteOffset + offset);
  let str = "";

  for (let i = 0; i < charArray.length; i++) {
    if (charArray[i] === 0) {
      break;
    }
    str += String.fromCharCode(charArray[i]);
  }
  return str;
}

export function parseSymbolTable(
  bytes: Uint8Array,
  sectionHeader: SectionHeader,
  stringTableOffset: bigint
): SymbolMap {
  const start = Number(sectionHeader.offset);
  const end = start + Number(sectionHeader.size);
  const entrySize = Number(sectionHeader.entsize);
  const tableLength = (end - start) / entrySize;
  const symbolTableBytes = bytes.slice(start, end);
  const view = new DataView(symbolTableBytes.buffer, symbolTableBytes.byteOffset, symbolTableBytes.byteLength);

  const symbolMap: SymbolMap = new Map();

  for (let i = 0; i < tableLength; i++) {
    const offset = i * entrySize;

    const nameOffset = view.getUint32(offset, true);
    const name = readNullTerminatedString(bytes, Number(stringTableOffset) + nameOffset);
    if (name === "") continue;

    const addr = view.getBigUint64(offset + 8, true);
    symbolMap.set(name, addr);
  }

  return symbolMap;
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

  const sectionHeaders = parseSectionHeaders(bytes, header.shoff, header.shentsize, header.shnum);
  const symbolTableHeader = sectionHeaders.find((section) => section.type === SHT_SYMTAB);

  const symbolMap = symbolTableHeader
    ? parseSymbolTable(bytes, symbolTableHeader, sectionHeaders[symbolTableHeader.link].offset)
    : (new Map() as SymbolMap);

  return {
    entry: header.entry,
    segments: segments,
    symbols: symbolMap,
  };
}
