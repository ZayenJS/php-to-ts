import { Command, Option } from "commander";
import { ConvertCommand } from "../Commands/ConvertCommand";

export class CLI {
  private _mainCommand: Command;

  constructor() {
    this._mainCommand = new Command();
    const convertCommand = new ConvertCommand();

    const phpToTsCommand = convertCommand.phpToTsCommand();
    this.addConvertCommand(phpToTsCommand);
  }

  version(version: string) {
    this._mainCommand.version(version);

    return this;
  }

  addConvertCommand(command: Command) {
    this._mainCommand.addCommand(command);
  }

  parse() {
    this._mainCommand.parse(process.argv);

    return this;
  }
}
