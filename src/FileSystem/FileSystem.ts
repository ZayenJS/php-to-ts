import fsp from "fs/promises";

export abstract class FileSystem {
  public static async isDirectory(path: string): Promise<boolean> {
    try {
      const stat = await fsp.stat(path);

      return stat.isDirectory();
    } catch (e) {
      return false;
    }
  }
}
