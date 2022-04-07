import * as fs from 'fs';
import * as Path from "path";

export default class FileSystem {

    static fileExists(file: string) {
        return fs.existsSync(file);
    }

    static dirExists(dir: string) {
        if (!this.isDir(dir)) return false;
        return this.fileExists(dir);
    }

    static mkdir(dir: string) {
        return fs.mkdirSync(dir);
    }

    static writeFile(path: string, data: any) {
        return fs.writeFileSync(path, data);
    }

    static copy(file: string, dir: string) {
        return fs.copyFileSync(file, dir);
    }

    static isDir(path: string) {
        let stats = fs.statSync(path);
        return stats.isDirectory();
    }

    static isFile(path: string) {
        let stats = fs.statSync(path);
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

    static getFileSize(path: string) {
        let stats = fs.statSync(path);
        return stats.size;
    }

    static readFile(path: string) {
        return fs.readFileSync(path);
    }

    static readFileAsStream(path: string) {
        return fs.createReadStream(path);
    }

    static walkDir(dir: string) {
        dir = Path.normalize(dir + Path.sep);
        return fs.readdirSync(dir).map(p => { return dir + p; });
    }

}