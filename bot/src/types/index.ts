import { ClientEvents, Client as DiscordClient } from "discord.js";
import { SheevBot } from "../base/sheev-bot";

export type EventName = keyof ClientEvents;

export interface Song {
    name: string;
    url: string;
    requestedBy: string;
}

declare module "discord.js" {
    // @ts-expect-error Override
    export interface Client extends DiscordClient {
        readonly config: SheevBot["config"];
    }
}