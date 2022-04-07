import { promises as fsAwait } from 'fs';
import * as fs from 'fs';
import * as Path from 'path';
export default class FileSystemAsync {
    static fileExists(file) {
        return fs.existsSync(file);
    }
    static dirExists(dir) {
        return this.fileExists(dir);
    }
    static async mkdir(dir) {
        return await fsAwait.mkdir(dir);
    }
    static async writeFile(path, data) {
        return await fsAwait.writeFile(path, data);
    }
    static async copy(file, dir) {
        return await fsAwait.copyFile(file, dir);
    }
    static async isDir(path) {
        let stats = await fsAwait.stat(path);
        return stats.isDirectory();
    }
    static async isFile(path) {
        let stats = await fsAwait.stat(path);
        return stats.isFile();
    }
    static normalize(path) {
        return Path.normalize(path);
    }
    static basename(path) {
        return Path.basename(path);
    }
    static dirname(path) {
        return Path.dirname(path);
    }
    static getExtension(path) {
        return Path.extname(path).substr(1);
    }
    static async getFileSize(path) {
        let stats = await fsAwait.stat(path);
        return stats.size;
    }
    static readFile(path) {
        return fs.readFileSync(path);
    }
    static readFileAsStream(path) {
        return fs.createReadStream(path);
    }
    static async walkDir(dir) {
        dir = Path.normalize(dir + Path.sep);
        return (await fsAwait.readdir(dir)).map(p => { return dir + p; });
    }
}
