import { Message } from "discord.js";
import { createEmbed } from "../utils/create-embed";
import { Inhibit } from "./inhibit";

const isUserInVoiceChannel = () => {
    return Inhibit(message => {
        if (!message.member?.voice.channel) {
            return message.channel.send({
                embeds: [createEmbed("warn", "I'm sorry, but you need to be in a voice channel to do that")]
            });
        }
    });
};

export { isUserInVoiceChannel };
