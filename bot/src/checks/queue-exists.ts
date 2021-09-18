import { createEmbed } from "../utils/create-embed";
import { Inhibit } from "./inhibit";

const queueExists = () => {
    return Inhibit(message => {
        if (message.guild?.queue === null)
            return message.channel.send({ embeds: [createEmbed("warn", "There is nothing playing.")] });
    })
};

export { queueExists };
