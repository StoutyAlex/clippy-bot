import { Message } from "discord.js";
import { Command, CommandMeta } from "../base/command";
import { SheevBot } from "../base/sheev-bot";
import { queueExists } from "../checks/queue-exists";
import { isSameVoiceChannel } from "../checks/same-voice-channel";
import { isUserInVoiceChannel } from "../checks/user-in-voice";
import { createEmbed } from "../utils/create-embed";

const meta: CommandMeta = {
    name: 'stop',
    alieses: ['end', 'kill', 'die']
}

class Stop extends Command {
    constructor(client: SheevBot) {
        super(client, meta);
    }
    
    @isUserInVoiceChannel()
    @queueExists()
    @isSameVoiceChannel()
    async run(message: Message, args: string[]) {
        message.guild?.queue?.songs.clear();
        message.guild?.queue?.currentPlayer?.stop(true);
        message.guild!.queue!.oldMusicMessage = null;
        message.guild!.queue!.oldVoiceStateUpdateMessage = null;

        message.channel.send({ embeds: [createEmbed("info", "⏹ Queue stopped.")] })
            .catch(e => console.error("STOP_CMD_ERR:", e));
    }
}

export { Stop as StopCommand };
