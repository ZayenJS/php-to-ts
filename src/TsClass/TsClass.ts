interface ConstructorProps {
  name: string;
  readonlyProperties?: string[];
  properties?: string[];
  methods?: string[];
}

export class TsClass {
  private name: string;
  private readonlyProperties?: string[];
  private properties?: string[];
  private methods?: string[];

  constructor({ name, readonlyProperties, properties, methods }: ConstructorProps) {
    this.name = name;
    this.readonlyProperties = readonlyProperties;
    this.properties = properties;
    this.methods = methods;
  }

  public toString() {
    const classReadonlyProperties = this.readonlyProperties
      ?.map((property) => {
        return `  ${property}`;
      })
      .join("\n");

    const classProperties = this.properties
      ?.map((property) => {
        return `  ${property}`;
      })
      .join("\n");

    const classMethods = this.methods
      ?.map((method) => {
        return `  ${method}\n`;
      })
      .join("\n");

    let data = `export class ${this.name} {\n`;
    data += classReadonlyProperties ? `${classReadonlyProperties}\n` : "";
    data += classReadonlyProperties && (classProperties || classMethods) ? "\n" : "";
    data += classProperties ? `${classProperties}\n` : "";
    data += classProperties && classMethods ? "\n" : "";
    data += classMethods ? `${classMethods}\n` : "";
    data += `}`;

    return data;
  }
}
