export default class Memory {
  size: bigint;
  buffer: ArrayBuffer;
  view: DataView;

  constructor(size: bigint) {
    this.size = size;
    this.buffer = new ArrayBuffer(Number(size)); // support up to 2^53 - 1 bytes
    this.view = new DataView(this.buffer);
  }

  loadBinary(binary: ArrayBuffer, address: bigint): void {
    const binaryLength = BigInt(binary.byteLength);
    if (address < 0n || address + binaryLength > this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    new Uint8Array(this.buffer).set(new Uint8Array(binary), Number(address));
  }

  // Read operations
  load8(address: bigint): number {
    if (address < 0n || address >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getInt8(Number(address));
  }

  load16(address: bigint): number {
    if (address < 0n || address + 1n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getInt16(Number(address), true);
  }

  load32(address: bigint): number {
    if (address < 0n || address + 3n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getInt32(Number(address), true);
  }

  load64(address: bigint): bigint {
    if (address < 0n || address + 7n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getBigInt64(Number(address), true);
  }

  loadU8(address: bigint): number {
    if (address < 0n || address >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getUint8(Number(address));
  }

  loadU16(address: bigint): number {
    if (address < 0n || address + 1n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getUint16(Number(address), true);
  }

  loadU32(address: bigint): number {
    if (address < 0n || address + 3n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getUint32(Number(address), true);
  }

  loadU64(address: bigint): bigint {
    if (address < 0n || address + 7n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getBigUint64(Number(address), true);
  }

  // Write operations
  store8(address: bigint, value: number) {
    if (address < 0n || address >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    this.view.setInt8(Number(address), value);
  }

  store16(address: bigint, value: number) {
    if (address < 0n || address + 1n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    this.view.setInt16(Number(address), value, true);
  }

  store32(address: bigint, value: number) {
    if (address < 0n || address + 3n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    this.view.setInt32(Number(address), value, true);
  }

  store64(address: bigint, value: bigint) {
    if (address < 0n || address + 7n >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    this.view.setBigUint64(Number(address), value, true);
  }
}
