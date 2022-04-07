import { promises as fsAwait } from 'fs';
import * as fs from 'fs';

import * as Path from 'path';

export default class FileSystemAsync {

    static fileExists(file: string) {
        return fs.existsSync(file);
    }

    static dirExists(dir: string) {
        if (!this.isDir(dir)) return false;
        return this.fileExists(dir);
    }

    static async mkdir(dir: string) {
        return await fsAwait.mkdir(dir);
    }

    static async writeFile(path: string, data: any) {
        return await fsAwait.writeFile(path, data);
    }

    static async copy(file: string, dir: string) {
        return await fsAwait.copyFile(file, dir);
    }

    static async isDir(path: string) {
        let stats = await fsAwait.stat(path);
        return stats.isDirectory();
    }

    static async isFile(path: string) {
        let stats = await fsAwait.stat(path);
        return stats.isFile();
    }

    static normalize(path: string) {
        return Path.normalize(path);
    }

    static basename(path: string) {
        return Path.basename(path);
    }

    static dirname(path: string) {
        return Path.dirname(path);
    }

    static getExtension(path: string) {
        return Path.extname(path).substr(1);
    }

    static async getFileSize(path: string) {
        let stats = await fsAwait.stat(path);
        return stats.size;
    }

    static readFile(path: string) {
        return fs.readFileSync(path);
    }

    static readFileAsStream(path: string) {
        return fs.createReadStream(path);
    }

    static async walkDir(dir: string) {
        dir = Path.normalize(dir + Path.sep);
        return (await fsAwait.readdir(dir)).map(p => { return dir + p; });
    }

}