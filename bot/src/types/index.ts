import { ClientEvents, Client as DiscordClient, Guild as DiscordGuild } from "discord.js";
import { Readable } from "stream";
import { SheevBot } from "../base/sheev-bot";
import { SongQueue } from "../base/song-queue";

export type EventName = keyof ClientEvents;

export interface Song {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    download(): Readable;
}

declare module "discord.js" {
    // @ts-expect-error Override
    export interface Client extends DiscordClient {
        readonly config: SheevBot["config"];
        readonly queue: SheevBot["queue"];
    }

    // @ts-expect-error Override
    export interface Guild extends DiscordGuild {
        queue: SongQueue | null;
    }
}