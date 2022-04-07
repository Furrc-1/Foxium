export default class Config {
    constructor(foxium) {
        this.foxium = foxium;
    }
    async init() {
        [this.public, this.private] = await Promise.all([
            this.foxium.util.loadConfig('public.json'),
            this.foxium.util.loadConfig('private.json')
        ]);
    }
}
