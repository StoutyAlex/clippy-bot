import { AudioPlayer, AudioPlayerStatus, AudioResource, VoiceConnection } from "@discordjs/voice";
import { Snowflake } from "discord-api-types";
import { StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { SongManager } from "./song-manager";

class SongQueue {
    public connection: VoiceConnection | null = null;
    public currentPlayer: AudioPlayer | null = null;
    public currentResource: AudioResource | null = null;

    public songs: SongManager = new SongManager();

    public textChannel: TextChannel | null = null;
    public voiceChannel: VoiceChannel | StageChannel | null = null;

    public volume: number = 0;

    private _lastMusicMessageID: Snowflake | null = null;
    private _lastVoiceStateUpdateMessageID: Snowflake | null = null;

    constructor(textChannel: TextChannel | null, voiceChannel: VoiceChannel | StageChannel | null) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;

        this.volume = textChannel!.client.config.defaultVolume;
    }

    public get playing(): boolean {
        return this.currentPlayer!.state.status === AudioPlayerStatus.Playing;
    }

    public get oldMusicMessage(): Snowflake | null {
        return this._lastMusicMessageID;
    }

    public get oldVoiceStateUpdateMessage(): Snowflake | null {
        return this._lastVoiceStateUpdateMessageID;
    }

    public set oldVoiceStateUpdateMessage(id: Snowflake | null) {
        if (this._lastVoiceStateUpdateMessageID !== null) {
            this.textChannel?.messages.fetch(this._lastVoiceStateUpdateMessageID, { cache: false })
                .then(m => m.delete())
                .catch(e => console.error("DELETE_OLD_VOICE_STATE_UPDATE_MESSAGE_ERR:", e));
        }
        this._lastVoiceStateUpdateMessageID = id;
    }
    
};

export { SongQueue };
