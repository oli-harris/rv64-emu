export default class Memory {
  size: number;
  offset: number;
  buffer: ArrayBuffer;
  view: DataView;

  constructor(size: number, offset: number = 0) {
    this.size = size; // support up to 2^53 - 1 bytes
    this.offset = offset;
    this.buffer = new ArrayBuffer(this.size);
    this.view = new DataView(this.buffer);
  }

  loadBinary(binary: ArrayBuffer, address: number): void {
    if (address - this.offset < 0 || address - this.offset + binary.byteLength > this.size) {
      throw new RangeError("Memory access out of bounds");
    }
    new Uint8Array(this.buffer).set(new Uint8Array(binary), address - this.offset);
  }

  // Read operations
  load8(address: number): number {
    if (address - this.offset < 0 || address - this.offset >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getInt8(address - this.offset);
  }

  load16(address: number): number {
    if (address - this.offset < 0 || address - this.offset + 1 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getInt16(address - this.offset, true);
  }

  load32(address: number): number {
    if (address - this.offset < 0 || address - this.offset + 3 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getInt32(address - this.offset, true);
  }

  load64(address: number): bigint {
    if (address - this.offset < 0 || address - this.offset + 7 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getBigInt64(address - this.offset, true);
  }

  loadU8(address: number): number {
    if (address - this.offset < 0 || address - this.offset >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getUint8(address - this.offset);
  }

  loadU16(address: number): number {
    if (address - this.offset < 0 || address - this.offset + 1 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getUint16(address - this.offset, true);
  }

  loadU32(address: number): number {
    if (address - this.offset < 0 || address - this.offset + 3 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getUint32(address - this.offset, true);
  }

  loadU64(address: number): bigint {
    if (address - this.offset < 0 || address - this.offset + 7 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    return this.view.getBigUint64(address - this.offset, true);
  }

  // Write operations
  store8(address: number, value: number) {
    if (address - this.offset < 0 || address - this.offset >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    this.view.setInt8(address - this.offset, value);
  }

  store16(address: number, value: number) {
    if (address - this.offset < 0 || address - this.offset + 1 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    this.view.setInt16(address - this.offset, value, true);
  }

  store32(address: number, value: number) {
    if (address - this.offset < 0 || address - this.offset + 3 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    this.view.setInt32(address - this.offset, value, true);
  }

  store64(address: number, value: bigint) {
    if (address - this.offset < 0 || address - this.offset + 7 >= this.size) {
      throw new RangeError("Memory access out of bounds");
    }

    this.view.setBigUint64(address - this.offset, value, true);
  }
}
