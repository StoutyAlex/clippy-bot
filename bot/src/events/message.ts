import { ClientEvents, Message, VoiceState as IVoiceState } from "discord.js";
import { Event } from "../base/event";
import { SheevBot } from "../base/sheev-bot";
import { commandHandler } from "../commands";
import { EventName } from "../types";

import { EventBridge } from 'aws-sdk';

import { MessageEvent as ClippyMessageEvent } from 'clippy-common';

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME!

interface MessageHandler {
    run: (...args: ClientEvents['messageCreate']) => any;
}

class MessageEvent extends Event implements MessageHandler {
    public static eventName: EventName = 'messageCreate';

    constructor(client: SheevBot) {
        super(client);
    }

    async run(message: Message) {
        if (message.author.bot || message.channel.type !== "GUILD_TEXT") return;

        const eb = new EventBridge();

        const entry: ClippyMessageEvent = {
            EventBusName: EVENT_BUS_NAME,
            Source: 'DiscordBot',
            DetailType: 'MessageReceived',
            Detail: JSON.stringify({ message })
        }

        const result = await eb.putEvents({ Entries: [entry] }).promise();

        if (message.content.toLowerCase().startsWith(this.client.config.prefix))
            commandHandler(this.client, message);
        return
    }
};

export { MessageEvent };
