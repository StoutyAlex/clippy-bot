import { joinVoiceChannel } from "@discordjs/voice";
import { Guild, Message, TextBasedChannels, TextChannel, VoiceChannel } from "discord.js";
import { Command, CommandMeta } from "../base/command";
import { SheevBot } from "../base/sheev-bot";
import { SongQueue } from "../base/song-queue";
import { Song } from "../types";
import { createEmbed } from "../utils/create-embed";

const meta: CommandMeta = {
    name: 'play',
    alieses: ['p', 'add']
}

class Play extends Command {
    constructor(client: SheevBot) {
        super(client, meta);
    }

    async run(message: Message, ...args: String[]) {
        const voiceChannel = message.member!.voice.channel!;
        if (!args[0]) {
            return message.channel.send({
                embeds: [createEmbed("warn", `Invalid argument, type \`${this.client.config.prefix}help play\` for more info`)]
            });
        }

        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        if (message.guild?.queue !== null && voiceChannel.id !== message.guild?.queue.voiceChannel?.id) {
            return message.channel.send({
                embeds: [createEmbed("warn", `The music player is already playing to **${message.guild!.queue.voiceChannel!.name}** voice channel`)]
            });
        }
    }
}

export { Play as PlayCommand };
