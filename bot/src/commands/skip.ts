import { Message } from "discord.js";
import { Command, CommandMeta } from "../base/command";
import { SheevBot } from "../base/sheev-bot";
import { queueExists } from "../checks/queue-exists";
import { isSameVoiceChannel } from "../checks/same-voice-channel";
import { isUserInVoiceChannel } from "../checks/user-in-voice";
import { createEmbed } from "../utils/create-embed";

const meta: CommandMeta = {
    name: 'skip',
    alieses: ['s', 'next']
}

class Skip extends Command {
    constructor(client: SheevBot) {
        super(client, meta);
    }

    @isUserInVoiceChannel()
    @queueExists()
    @isSameVoiceChannel()
    public run(message: Message): any {

        if (message.guild?.queue?.playing === false) message.guild.queue.currentPlayer?.unpause();
        message.guild!.queue?.currentPlayer!.stop();

        const song = message.guild?.queue?.songs.first();

        message.channel.send({
            embeds: [
                createEmbed("info", `⏭ Skipped **[${song!.title}](${song!.url}})**`)
                    .setThumbnail(song?.thumbnail as string)
            ]
        }).catch(e => console.error("SKIP_CMD_ERR:", e));
    }

}

export { Skip as SkipCommand };
