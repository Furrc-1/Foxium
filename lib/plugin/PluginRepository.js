import fetch from 'node-fetch';
export class PluginRepositoryManager {
    constructor(foxium) {
        this.cache = new Map();
        this.foxium = foxium;
    }
    getRepository(index) {
        return this.cache.get(index) || this.loadRepository(index);
    }
    loadRepository(index) {
        return fetch(index).then(async (v) => ({ index, data: await v.json() }));
    }
    clearCache() {
        this.cache.clear();
    }
    async getPluginInfo(pluginMeta) {
        const repository = await this.getRepository(pluginMeta.repository);
        return repository.data.find(v => v.uuid === pluginMeta.uuid);
    }
}
