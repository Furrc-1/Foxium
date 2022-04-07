import { Foxium } from '../index.js';

export default class Config {
    foxium: Foxium;
    private: any;
    public: any;

    constructor(foxium: Foxium) {
        this.foxium = foxium;
    }

    async init() {
        [ this.public, this.private ] = await Promise.all([
            this.foxium.util.loadConfig('public.json'),
            this.foxium.util.loadConfig('private.json')
        ])
    }

}