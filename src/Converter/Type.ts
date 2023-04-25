import { ConversionDirection } from "../@types/enums/ConversionDirection";

const phpToTsTypes = {
  int: "number",
  string: "string",
  bool: "boolean",
  Collection: "unknown[]",
} as const;

const tsToPhpTypes = {
  number: "int",
  string: "string",
  boolean: "bool",
} as const;

export type PhpToTsTypes = typeof phpToTsTypes;
export type TsToPhpTypes = typeof tsToPhpTypes;

export class TypeConverter {
  private static phpToTsTypes = phpToTsTypes;

  private static tsToPhpTypes = tsToPhpTypes;

  public static convert<T>(type: T, direction: ConversionDirection) {
    switch (direction) {
      case ConversionDirection.PHP_TO_TS:
        return this.phpToTsTypes[type as keyof typeof phpToTsTypes];
      case ConversionDirection.TS_TO_PHP:
        return this.tsToPhpTypes[type as keyof typeof tsToPhpTypes];
    }
  }
}
