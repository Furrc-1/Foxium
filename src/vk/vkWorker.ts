import * as VKLib from 'vk-io';
import { Foxium } from '../index.js';

const { VK } = VKLib;

export default class VkWorker {
    foxium: Foxium
    api: any;
    updates: any;
    VKLib: typeof VKLib;

    constructor(foxium: Foxium) {
        this.foxium = foxium;
    }

    init() {
        const vk = new VK({
            pollingGroupId: this.foxium.config.public.vk.groupId,
            token: this.foxium.config.private.vk.token,
            webhookSecret: this.foxium.config.private.vk.webhookSecret,
            webhookConfirmation: this.foxium.config.private.vk.webhookConfirmation,
            apiLimit: this.foxium.config.public.vk.apiLimit || 20
        });

        this.checkToken(vk);
        this.VKLib = VKLib;
        return vk;
    }

    checkToken(vk) {
        vk.api.messages.getConversations({ count: 0 }).catch(err => {
            throw Error(`Вы неправильно указали токен группы в config/private.json (${err.message})`);
        });
    }

    async start() {
        if (this.foxium.config.public.vk.useWebhook) {
            this.foxium.log('Запускаю Webhook...');
            await this.foxium.vk.updates.startWebhook(this.foxium.config.public.vk.webhookOptions || {});
        } else {
            this.foxium.log('Запускаю Longpoll...');
            await this.foxium.vk.updates.startPolling();
        }
    }
}