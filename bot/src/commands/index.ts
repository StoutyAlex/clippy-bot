import { Message } from "discord.js";
import { Command } from "../base/command";
import { SheevBot } from "../base/sheev-bot";
import { PlayCommand } from "./play";
import { StatusCommand } from "./status";

export const commands: typeof Command[] = [
    StatusCommand,
    PlayCommand
]

const commandHandler = (client: SheevBot, message: Message) => {
    const args = message.content.substring(client.config.prefix.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();

    const command = client.commands.find(com => com.meta!.name === cmd || com.meta!.alieses?.includes(cmd!));

    if (command) {
        command.run(message, ...args);
    }
};

export { commandHandler };

