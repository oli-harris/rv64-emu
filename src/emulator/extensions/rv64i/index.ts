import type { Extension } from "../extension";
import { decode } from "./decode";
import { execute } from "./execute";
import { RV64i } from "./instructions";

export default class RV64iExtension implements Extension {
  name = "RV64I";
  instruction = RV64i;
  decode = decode;
  execute = execute;
}
