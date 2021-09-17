import { Client, Guild, Intents, Collection, Snowflake } from "discord.js";
import { commands as sheevCommands } from "../commands";
import * as config from '../config';
import { events } from "../events";
import { Command } from "./command";

// Extends DiscordJS Structures
import "./Guild";

class SheevBot extends Client {
    public readonly config = config;
    public queue: Collection<Snowflake, []> = new Collection();
    public commands: Command[] = [];

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.DIRECT_MESSAGES
            ],
            allowedMentions: {
				parse: ["users"]
			}
        });
    }

    async start(token: string) {
        this.on('ready', () => {
            this.commands = sheevCommands.map(cmd => new cmd(this));
        });

        Object.entries(events).forEach(([name, handler]) => {
            const eventHandler = new handler(this);
            this.on(name, (...args) => eventHandler.run(...args));
            console.log('Added new event for', name);
        });

        this.login(token);
        return this;
    }
};

export { SheevBot };
