import { Message, MessageEmbed } from "discord.js";
import { Command, CommandMeta } from "../base/command";
import { SheevBot } from "../base/sheev-bot";
import { version } from "../config";

const meta: CommandMeta = {
    name: 'status',
    alieses: ['stat', 'uptime', 'alive'],
};

class Status extends Command {
    constructor(client: SheevBot) {
        super(client, meta);
    };

    async run(message: Message, args: string[]): Promise<any> {
        const embed: MessageEmbed = new MessageEmbed()
            .setTitle('Sheev Bot Status')
            .setColor('GREEN')
            .setFooter(`Sheev Bot - v${version}`)
            .setFields([
                {
                    name: 'Uptime',
                    value: '1 Day'
                }
            ])
        
        return message.channel.send({ embeds: [ embed ]});
    }
}

export { Status as StatusCommand };
