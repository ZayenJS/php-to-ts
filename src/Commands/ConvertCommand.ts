import fsp from "fs/promises";
import { Command, Option } from "commander";
import { ConversionType } from "../@types/enums/ConversionType";
import { FileSystem } from "../FileSystem/FileSystem";
import { ConversionDirection } from "../@types/enums/ConversionDirection";
import { PhpToTsTypes, TypeConverter } from "../Converter/Type";
import { TsClass } from "../TsClass/TsClass";

export class ConvertCommand {
  private _direction = ConversionDirection.PHP_TO_TS;

  private readonly constRegex = {
    php: /(public|private|protected)\s+const\s+(.*?)\s+=\s+(.*?);/gi,
    ts: "",
  };

  private readonly propertyRegex = {
    php: /(public|private|protected)\s+(\??int|string|bool|Collection)\s+\$(.*?)(:?=|;)\s+?([a-z0-9]+)?;?/gi,
    ts: "",
  };

  private readonly functionRegex = {
    php: /(public|private|protected)\s+function\s+(.*?)\((.*)\):?(.*)/gi,
    ts: "",
  };

  public phpToTsCommand() {
    const command = new Command("php-to-ts");
    const fileOption = new Option("-f, --file <file>", "The PHP file to convert").makeOptionMandatory(true);
    const outputOption = new Option("-o, --output <output>", "The output file").makeOptionMandatory(true);
    const typeOption = new Option(
      "-t, --type <type>",
      `The type of conversion to perform (format is <from>:<to>) (default: ${ConversionType.CLASS_TO_CLASS}` + ")"
    )
      .makeOptionMandatory(false)
      .default(ConversionType.CLASS_TO_CLASS);

    command
      .description("Converts a PHP file to a TypeScript file")
      .addOption(fileOption)
      .addOption(outputOption)
      .addOption(typeOption)
      .action(this._phpToTsAction);

    return command;
  }

  private _phpToTsAction = async (options: any) => {
    this._direction = ConversionDirection.PHP_TO_TS;

    try {
      await fsp.access(options.file);
    } catch (e) {
      console.error(`${options.file} does not exist.\nPlease provide a valid file to convert.\nExiting...`);
      process.exit(1);
    }

    const isOutputDirectory = await FileSystem.isDirectory(options.output);
    let output = options.output;

    if (isOutputDirectory) {
      const inputFileName = options.file.split("/").pop().replace(".php", ".ts");
      output += `/${inputFileName}`;
    }

    const phpFileContent = await fsp.readFile(options.file, { encoding: "utf-8" });

    const className = this._getClassName(phpFileContent);
    const classProperties = this._getClassProperties(phpFileContent);
    const constProperties = this._getConstProperties(phpFileContent);
    const functions = this._getFunctions(phpFileContent);

    let content = "";

    if (options.type === ConversionType.CLASS_TO_CLASS && this._direction === ConversionDirection.PHP_TO_TS) {
      const tsClass = new TsClass({
        name: className,
        properties: classProperties,
        readonlyProperties: constProperties,
        methods: functions,
      });

      content = tsClass.toString();
    }

    await fsp.writeFile(output, content);
  };

  private _getClassName(phpFileContent: string): string {
    const classNameRegex = /class\s+(\w+)/;
    const matches = phpFileContent.match(classNameRegex);

    if (matches === null) {
      console.error("Could not find a class name in the provided file.\nExiting...");
      process.exit(1);
    }

    return matches[1];
  }

  private _getClassProperties(phpFileContent: string): string[] {
    if (this._direction === ConversionDirection.PHP_TO_TS) {
      const matches = phpFileContent.matchAll(this.propertyRegex.php);

      const classProperties: string[] = [];

      for (const match of matches) {
        const [_, accessor, type, name, equalOrSemicolon, value] = match;

        let _type = type;
        const isNullable = type.includes("?");

        _type = TypeConverter.convert(type.replace("?", "") as keyof PhpToTsTypes, ConversionDirection.PHP_TO_TS);

        let property = `${accessor} ${name.trim()}`;

        property += isNullable ? `: ${_type}|null` : `: ${_type}`;

        property += value ? ` = ${value}` : ";";

        classProperties.push(property);
      }

      return classProperties;
    }

    return [];
  }

  private _getConstProperties(phpFileContent: string): string[] {
    if (this._direction === ConversionDirection.PHP_TO_TS) {
      const matches = phpFileContent.matchAll(this.constRegex.php);

      const constProperties: string[] = [];

      for (const match of matches) {
        let property = match[0]
          .replace("$", "")
          .replace("const", "readonly")

          .trim();

        constProperties.push(property);
      }

      return constProperties;
    }

    return [];
  }

  private _getFunctions(phpFileContent: string): string[] {
    if (this._direction === ConversionDirection.PHP_TO_TS) {
      const matches = phpFileContent.matchAll(this.functionRegex.php);

      const functions: string[] = [];

      for (const match of matches) {
        const [_, accessor, name, parameters, returnType] = match;

        let _name = name;

        if (name === "__construct") _name = "constructor";
        else if (name === "__toString") _name = "toString";

        let functionString = `${accessor} ${_name}()`;
        // TODO: add params and return type

        functionString += " {\n  }";

        functions.push(functionString);
      }

      return functions;
    }

    return [];
  }
}
