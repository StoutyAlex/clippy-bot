import { createEmbed } from "../utils/create-embed";
import { Inhibit } from "./inhibit";

const isSameVoiceChannel = () => {
    return Inhibit(message => {
        if (!message.guild?.me?.voice.channel) return undefined;
        const botVoiceChannel = message.guild.queue?.voiceChannel?.id ?? message.guild.me.voice.channel.id;
        if (message.member?.voice.channel?.id !== botVoiceChannel) {
            return message.channel.send({
                embeds: [createEmbed("warn", "You need to be in the same voice channel as mine")]
            });
        }
    });
};
 
export { isSameVoiceChannel };
