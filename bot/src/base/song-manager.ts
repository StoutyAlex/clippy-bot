import Collection from "@discordjs/collection";
import { Snowflake } from "discord-api-types";
import { SnowflakeUtil } from "discord.js";
import { Song } from "../types";

class SongManager extends Collection<Snowflake, Song> {
    constructor(data?: ReadonlyArray<readonly [Snowflake, Song]> | null) {
        super(data);
    }

    public addSong(song: Song) {
        return this.set(SnowflakeUtil.generate(), song);
    }

    public deleteFirst() {
        return this.delete(this.firstKey()!);
    }

    public clear() {
        this.forEach((song: Song, snowflake: Snowflake) => {
            this.delete(snowflake)
        });

        return this;
    }
}

export { SongManager };
