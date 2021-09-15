import { ClientEvents, Message, VoiceState as IVoiceState } from "discord.js";
import { Event } from "../base/event";
import { SheevBot } from "../base/sheev-bot";
import { commandHandler } from "../commands";
import { EventName } from "../types";

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

        if (message.content.toLowerCase().startsWith(this.client.config.prefix))
            commandHandler(this.client, message);
        return
    }
};

export { MessageEvent };
