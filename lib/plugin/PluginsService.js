import { promises as fs } from 'fs';
import AdmZip from 'adm-zip';
import os from 'os';
export class PluginMeta {
}
export default class PluginService {
    constructor(foxium) {
        this.foxium = foxium;
        this.pluginsMeta = [];
    }
    async init() {
        this.pluginsMeta = await this.foxium.util.loadConfig('plugins-meta.json');
        await this.checkPlugins();
    }
    checkPlugins() {
        return Promise.all(this.pluginsMeta.map(v => this.checkPlugin(v)));
    }
    async checkPlugin(pluginMeta) {
        const path = `${this.foxium.pluginDir}/${pluginMeta.slug}`;
        const exists = await fs.stat(path).then(() => true).catch(() => false);
        if (exists) {
            return;
        }
        this.foxium.log(`Plugin '${pluginMeta.slug}' not found.`);
        await this.installPlugin(pluginMeta);
    }
    async installPlugin(pluginMeta) {
        const fullMeta = { ...pluginMeta, ...await this.foxium.pluginRepositoryManager.getPluginInfo(pluginMeta) };
        const tempFilePath = `${os.tmpdir()}/henta-plugin-${fullMeta.uuid}.zip`;
        this.foxium.log(`Downloading '${fullMeta.slug}' (${fullMeta.uuid}) from ${fullMeta.file}...`);
        await this.foxium.util.downloadFile(fullMeta.file, tempFilePath);
        this.foxium.log(`Unpacking plugin '${fullMeta.slug}' (${fullMeta.uuid})...`);
        await new Promise(r => new AdmZip(tempFilePath).extractAllToAsync(`plugins/${fullMeta.slug}`, true, r));
        await fs.unlink(tempFilePath);
        pluginMeta.version = fullMeta.version;
        await this.save();
        this.foxium.log(`${fullMeta.slug} ${fullMeta.version} installed.`);
    }
    async start() {
        const updates = await this.checkUpdates();
        updates.forEach(v => {
            this.foxium.log(`New version ${v.slug} [${v.version} > ${v.newVersion}]`);
        });
    }
    async checkUpdates() {
        const checks = await Promise.all(this.pluginsMeta.map(v => this.checkUpdate(v)));
        return this.pluginsMeta.map((v, i) => ({ newVersion: checks[i], ...v })).filter(v => v.newVersion);
    }
    async checkUpdate(pluginMeta) {
        const repoMeta = await this.foxium.pluginRepositoryManager.getPluginInfo(pluginMeta);
        return repoMeta.version === pluginMeta.version ? false : repoMeta.version;
    }
    async save() {
        await fs.writeFile('config/plugins-meta.json', JSON.stringify(this.pluginsMeta, null, '\t'));
    }
}
