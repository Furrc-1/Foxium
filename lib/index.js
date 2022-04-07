import minimist from 'minimist';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Util from './utils/Util.js';
import VkWorker from './vk/vkWorker.js';
import Config from './utils/Config.js';
import FileSystem from './utils/FileSystem.js';
import FileSystemAsync from './utils/FileSystemAsync.js';
import Logger from './utils/Logger.js';
import Command from './command/Command.js';
import { PluginRepositoryManager } from './plugin/PluginRepository.js';
import PluginManager from './plugin/PluginManager.js';
import PluginService from './plugin/PluginsService.js';
export class Foxium {
    constructor() {
        this.fileSystem = FileSystem;
        this.fileSystemAsync = FileSystemAsync;
        this.util = new Util(this);
        this.config = new Config(this);
        this.logger = new Logger(this, 'Foxium');
        this.cmd = new Command(this);
        this.pluginRepositoryManager = new PluginRepositoryManager(this);
        this.pluginManager = new PluginManager(this);
        this.pluginService = new PluginService(this);
        this.vkWorker = new VkWorker(this);
        this.botdir = path.resolve('.');
        this.configDir = `${this.botdir}/config`;
        this.dataDir = `${this.botdir}/data`;
        this.pluginDir = `${this.botdir}/plugins`;
        this.argv = minimist(process.argv.slice(2));
        this.info = (msg) => this.logger.info(msg);
        this.log = (msg) => this.logger.log(msg);
        this.warning = (msg) => this.logger.warning(msg);
        this.error = (msg) => this.logger.error(msg);
        this.shutdownCallbacks = [];
    }
    async init() {
        const dirModule = path.dirname(fileURLToPath(import.meta.url));
        if (!this.fileSystem.dirExists(this.configDir)) {
            this.fileSystem.mkdir(this.configDir);
            this.fileSystem.writeFile(`${this.configDir}/public.json`, this.fileSystem.readFile(`${dirModule}/../default_data/public.json`));
            this.fileSystem.writeFile(`${this.configDir}/private.json`, this.fileSystem.readFile(`${dirModule}/../default_data/private.json`));
        }
        if (!this.fileSystem.dirExists(this.dataDir)) {
            this.fileSystem.mkdir(this.dataDir);
        }
        if (!this.fileSystem.dirExists(this.pluginDir)) {
            this.fileSystem.mkdir(this.pluginDir);
            this.fileSystem.writeFile(`${this.configDir}/plugins.json`, `[]`);
            this.fileSystem.writeFile(`${this.configDir}/plugins-meta.json`, `[]`);
        }
        const packageData = await this.util.load(`${dirModule}/../package.json`);
        this.version = packageData.version;
        try {
            this.info(`Foxium (HENTA) V${this.version}.`);
            if (this.argv.service) {
                this.warning('Bot started in service mode.');
                return;
            }
            await this.config.init();
            this.vk = await this.vkWorker.init();
            await this.pluginService.init();
            await this.pluginManager.loadPlugins();
            await this.pluginManager.initPlugins();
            process.on('SIGINT', () => this.shutdown());
        }
        catch (error) {
            this.error(`Bot init: ${error.stack}`);
            await this.shutdown(1);
        }
    }
    async start() {
        try {
            await this.pluginManager.startPlugins();
            await this.vkWorker.start();
            process.on('uncaughtException', error => {
                this.error(`Runtime error: ${error.stack}`);
            });
            this.log('The bot is up and running.');
            await this.pluginService.start();
        }
        catch (error) {
            this.error(`Bot start: ${error.stack}`);
            await this.shutdown(1);
        }
    }
    async shutdown(code = 0) {
        this.log('Shutting down Foxium...');
        await Promise.all(this.shutdownCallbacks.map(v => v()));
        this.log('Exit.');
        process.exit(code);
    }
    onShutdown(cb) {
        this.shutdownCallbacks.push(cb);
    }
}
