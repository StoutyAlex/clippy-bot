import { Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
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
        
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('pause')
                    .setEmoji('▶️')
                    .setStyle('SECONDARY')
            )

        const statusMessage = await message.channel.send({ embeds: [ embed ], components: [row] });

        const collector = statusMessage.channel.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', async i => {
            await i.update({ content: 'A button was clicked!', components: [] });
        })
    }
}

export { Status as StatusCommand };
