import fetch from 'node-fetch';
import { Foxium } from '../index.js';
import { PluginMeta } from './PluginsService';

export interface PluginRepository {
    index: string;
    data: PluginMeta[];
}

export class PluginRepositoryManager {
    foxium: Foxium;
    cache = new Map<string, PluginRepository>();

    constructor(foxium: Foxium) {
        this.foxium = foxium;
    }

    getRepository(index) {
        return this.cache.get(index) || this.loadRepository(index);
    }

    loadRepository(index) {
        return fetch(index).then(async v => ({ index, data: await v.json() })) as Promise<PluginRepository>;
    }

    clearCache() {
        this.cache.clear();
    }

    async getPluginInfo(pluginMeta: PluginMeta) {
        const repository = await this.getRepository(pluginMeta.repository);
        return repository.data.find(v => v.uuid === pluginMeta.uuid);
    }
}
