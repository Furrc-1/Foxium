import * as fs from 'fs';
import * as Path from 'path';
export default class FileSystem {
    static fileExists(file) {
        return fs.existsSync(file);
    }
    static dirExists(dir) {
        return this.fileExists(dir);
    }
    static mkdir(dir) {
        return fs.mkdirSync(dir);
    }
    static writeFile(path, data) {
        return fs.writeFileSync(path, data);
    }
    static copy(file, dir) {
        return fs.copyFileSync(file, dir);
    }
    static isDir(path) {
        let stats = fs.statSync(path);
        return stats.isDirectory();
    }
    static isFile(path) {
        let stats = fs.statSync(path);
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
    static getFileSize(path) {
        let stats = fs.statSync(path);
        return stats.size;
    }
    static readFile(path) {
        return fs.readFileSync(path);
    }
    static readFileAsStream(path) {
        return fs.createReadStream(path);
    }
    static walkDir(dir) {
        dir = Path.normalize(dir + Path.sep);
        return fs.readdirSync(dir).map(p => { return dir + p; });
    }
}
