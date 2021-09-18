import { Message } from "discord.js";
import { Command } from "../base/command";
import { SheevBot } from "../base/sheev-bot";
import { PlayCommand } from "./play";
import { SkipCommand } from "./skip";
import { StatusCommand } from "./status";
import { StopCommand } from "./stop";

export const commands: typeof Command[] = [
    StatusCommand,
    PlayCommand,
    SkipCommand,
    StopCommand
]

const commandHandler = (client: SheevBot, message: Message) => {
    const args = message.content.substring(client.config.prefix.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();

    const command = client.commands.find(com => com.meta!.name === cmd || com.meta!.alieses?.includes(cmd!));

    if (command) {
        command.run(message, args);
    }
};

export { commandHandler };

