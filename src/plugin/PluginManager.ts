import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import { Foxium } from '../index';

export default class PluginManager {
    foxium: Foxium;
    list = [];
    pluginFromSlug = {};
    instanceFromSlug = {};
    bridges = [];

    constructor(foxium: Foxium) {
        this.foxium = foxium;
    }

    async loadPlugins() {
        this.foxium.log('Loading plugins...');
        const pluginList = await this.foxium.util.loadConfig('plugins.json');
        const startAt = Date.now();
        await Promise.all(pluginList.map(v => this.loadPlugin(v)));

        this.foxium.log(`Plugins loaded successfully (${this.list.length} шт./${Date.now() - startAt} мс.).`);
    }

    isClass(obj) {
        const isCtorClass = obj.constructor
            && obj.constructor.toString().substring(0, 5) === 'class'
        if(obj.prototype === undefined) {
            return isCtorClass
        }
        const isPrototypeCtorClass = obj.prototype.constructor
            && obj.prototype.constructor.toString
            && obj.prototype.constructor.toString().substring(0, 5) === 'class'
        return isCtorClass || isPrototypeCtorClass
    }

    async loadPlugin(pluginSlug: string) {
        try {
            const pluginPath = `${this.foxium.pluginDir}/${pluginSlug}`;
            const packageJson = await this.foxium.util.load(`${pluginPath}/package.json`);

            // Check installed deps
            const nodeModulesExist = this.foxium.fileSystem.dirExists(`${pluginPath}/node_modules`);
            if ((packageJson.dependencies || packageJson.devDependencies) && !nodeModulesExist) {
                this.foxium.warning(`${pluginSlug} not installed dependencies. Installing...`);
                execSync(`cd src/plugins/${pluginSlug} && yarn`, {stdio: 'inherit'});
            }

            // Check building
            const libExist = this.foxium.fileSystem.dirExists(`${pluginPath}/lib`);
            if (packageJson.scripts && packageJson.scripts.build && !libExist) {
                this.foxium.warning(`${pluginSlug} not builded. Building...`);
                execSync(`cd src/plugins/${pluginSlug} && yarn build`, {stdio: 'inherit'});
            }

            const { default: rawPluginClass } = await import(`file:///${pluginPath}/${packageJson.main}`);
            const PluginClass = this.isClass(rawPluginClass) ? rawPluginClass : rawPluginClass.default;
            const pluginInfo = {
                slug: pluginSlug,
                instance: new PluginClass(this.foxium)
            };

            this.pluginFromSlug[pluginSlug] = pluginInfo;
            this.instanceFromSlug[pluginSlug] = pluginInfo.instance;
            this.list.push(pluginInfo);
            this.foxium.log(`Loaded ${pluginSlug}.`);
        } catch (error) {
            this.foxium.error(`Load plugin ${pluginSlug}:\n${error.stack}`);
            process.exit();
        }
    }

    async runTask(pluginInfo, task) {
        const startAt = Date.now();
        await pluginInfo.instance[task](this.foxium);

        pluginInfo.tasks = pluginInfo.tasks || {};
        pluginInfo.tasks[task] = Date.now() - startAt;
    }

    async runTasks(list, task) {
        return Promise.all(list.filter(v => v.instance[task]).map(v => this.runTask(v, task)));
    }

    async initPlugins() {
        await this.runTasks(this.list, 'preInit');
        await this.runTasks(this.bridges, 'init');
        await this.runTasks(this.list, 'init');
        this.foxium.log(`Plugins was initialized.`);
    }

    async startPlugins() {
        await this.runTasks(this.list, 'preStart');
        await this.runTasks(this.bridges, 'start');
        await this.runTasks(this.list, 'start');
        this.foxium.log(`Plugins was started.`);
    }

    getPluginInfo(pluginSlug: string) {
        return this.pluginFromSlug[pluginSlug];
    }

    getPlugin(pluginSlug: string) {
        return this.instanceFromSlug[pluginSlug];
    }

    useBridges(bridgesOptions) {
        const bridges = bridgesOptions
            .filter(v => this.getPlugin(v.plugin))
            .map(v => ({ ...v, instance: new v.class(this.foxium) }));

        bridges.forEach(v => this.bridges.push(v));
        return bridges;
    }
}