import { Message } from "discord.js";
import { Command, CommandMeta } from "../base/command";
import { SheevBot } from "../base/sheev-bot";

const meta: CommandMeta = {
    name: 'play',
    alieses: ['p', 'add']
}

class Play extends Command {
    constructor(client: SheevBot) {
        super(client, meta);
    }

    async run(message: Message, ...args: String[]) {

    }
}

export { Play as PlayCommand };
