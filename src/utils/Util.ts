import { Foxium } from '../index.js';
import * as path from 'path';
import fetch from 'node-fetch';

export default class Util {
    foxium: Foxium;

    constructor(foxium: Foxium) {
        this.foxium = foxium;
    }

    load(filePath: string) {
        const fullPath = path.isAbsolute(filePath)
            ? filePath
            : `${this.foxium.botdir}/${filePath}`;

        const data = this.foxium.fileSystem.readFile(fullPath);
        return JSON.parse(data.toString());
    }

    loadConfig(filePath: string) {
        return this.load(`config/${filePath}`);
    }

    loadData(filePath: string) {
        return this.load(`data/${filePath}`);
    }

    createFromSlug(array) {
        return Object.fromEntries(array.map(v => [v.slug, v]));
    }

    loadEnts(filePath: string) {
        const data = this.load(filePath);
        return [data, this.createFromSlug(data)];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    pickRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    pickRandomIndex(array) {
        return Math.floor(Math.random() * array.length);
    }

    randomRange(min, max) {
        return min + Math.floor((max - min) * Math.random());
    }

    chunk(array, chunkSize) {
        return new Array(Math.ceil(array.length / chunkSize)).fill(0)
            .map((x, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize));
    }

    downloadFile(url, outputPath) {
        return fetch(url)
            .then(x => x.arrayBuffer())
            .then(x => this.foxium.fileSystem.writeFile(outputPath, Buffer.from(x)));
    }
}