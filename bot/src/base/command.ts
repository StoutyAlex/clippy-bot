import { Message } from "discord.js";
import { SheevBot } from "./sheev-bot";
import { ICommand } from '../types';

export interface CommandMeta {
    name: string;
    alieses?: string[];
}

class Command implements ICommand {
    constructor(public client: SheevBot, public meta?: CommandMeta) {};

    async run(message: Message, args: string[]): Promise<any> {
        return;
    }
};

export { Command };