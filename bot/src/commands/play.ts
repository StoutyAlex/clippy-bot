import { AudioPlayerError, AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { Guild, Message, StageChannel, TextBasedChannels, TextChannel, VoiceChannel } from "discord.js";
import { Command, CommandMeta } from "../base/command";
import { SheevBot } from "../base/sheev-bot";
import { SongQueue } from "../base/song-queue";
import { Song } from "../types";
import { createEmbed } from "../utils/create-embed";
import { Video, YouTube } from "../youtube";

const meta: CommandMeta = {
    name: 'play',
    alieses: ['p', 'add']
}

const isPlaylist = (url: string) => /^https?:\/\/((www|music)\.youtube\.com|youtube.com)\/playlist(.*)$/.exec(url);

const getVideo = async (url: string, searchString: string): Promise<Video | Video[]>  => {
    try {
        return await YouTube.getVideo(url);
    } catch (error) {
        return await YouTube.searchVideos(searchString);
    }
}

class Play extends Command {
    
    constructor(client: SheevBot) {
        super(client, meta);
    }

    async run(message: Message, ...args: string[]) {
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

        if (isPlaylist(url)) return this.handlePlaylist(url, message, voiceChannel);

        let video: Video | Video[];
        try {
          video = await getVideo(url, searchString);

          if (video instanceof Array) return this.handleMultipleVideos(video, message, voiceChannel);
          return this.handleVideo(video, message, voiceChannel);
        } catch (error) {
            console.error(error);
            return message.channel.send({ embeds: [createEmbed("error", `I could not obtain any search results!`)] });
        }
    }

    private async handleMultipleVideos(videos: Video[], message: Message, voiceChannel: VoiceChannel | StageChannel) {
        if (!videos.length) return message.channel.send({ embeds: [createEmbed("warn", "I could not obtain any search results!")] });

        if (videos.length === 1) {
            const directVideo = await YouTube.getVideo(videos[0].id);
            return this.handleVideo(directVideo, message, voiceChannel);
        }

        const directVideo = await YouTube.getVideo(videos[0].id);
        return this.handleVideo(directVideo, message, voiceChannel);
    }

    private async handleVideo(video: Video, message: Message, voiceChannel: VoiceChannel | StageChannel, playlist = false): Promise<any> {
        const song: Song = {
            download: () => video.download("audio"),
            id: video.id,
            thumbnail: video.bestThumbnailURL!,
            title: video.title,
            url: video.url
        };

        if (!message.guild!.queue) {
            message.guild!.queue = new SongQueue(message.channel as TextChannel, voiceChannel);
        }

        message.guild!.queue!.songs.addSong(song);

        try {
            const connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild!.id,
                adapterCreator: message.guild!.voiceAdapterCreator,
                selfDeaf: true
            });

            message.guild!.queue!.connection = connection;
        } catch (error) {
            message.guild?.queue?.songs.clear();
            message.guild!.queue = null;
            console.error("PLAY_CMD_ERR:", error);
            message.channel.send({ embeds: [createEmbed("error", `Error: Could not join the voice channel!`)] })
                .catch(e => console.error("PLAY_CMD_ERR:", e));
            return undefined;
        }

        this.play(message.guild!).catch(err => {
            console.error(err);
        });

        return message;
    };

    private async play(guild: Guild) {
        const queue = guild.queue;
        if (!queue) return undefined;
        if (queue.currentPlayer === null) queue.currentPlayer = createAudioPlayer();

        const song = queue.songs.first();

        if (!song) {
            queue.oldMusicMessage = null;
            queue.oldVoiceStateUpdateMessage = null;
            queue.textChannel?.send({
                embeds: [createEmbed("info", `⏹ Queue is finished! Use "${guild.client.config.prefix}play" to play more music`)]
            }).catch(e => console.error("PLAY_ERR:", e));
            queue.connection?.disconnect();
            return guild.queue = null;
        }

        const songData = song.download();

        queue.currentResource = createAudioResource<any>(songData, { inlineVolume: false });

        songData.on("error", err => { err.message = `YTDLError: ${err.message}`; });

        queue.connection?.subscribe(queue.currentPlayer);

        entersState(queue.connection!, VoiceConnectionStatus.Ready, 15 * 1000).then(() => {
            queue.currentPlayer?.play(queue.currentResource!)
        }).catch(e => {
            if (e.message === "The operation was aborted") e.message = "Could not establish a voice connection within 15 seconds.";
            queue.currentPlayer!.emit("error", new AudioPlayerError(e, queue.currentResource!));
        });

        queue.currentPlayer.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Playing) {
                if (oldState.status === AudioPlayerStatus.Paused) return undefined;

                queue.textChannel?.send({ embeds: [createEmbed("info", `▶ Start playing: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail)] })
                .then(m => queue.oldMusicMessage = m.id)
                .catch(e => console.error("PLAY_ERR:", e));
                return undefined;
            }

            if (newState.status === AudioPlayerStatus.Idle) {
                queue.songs.deleteFirst();

                queue.textChannel?.send({ embeds: [createEmbed("info", `⏹ Stop playing: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail)] })
                .then(m => queue.oldMusicMessage = m.id)
                .catch(e => console.error("PLAY_ERR:", e))
                .finally(() => {
                    queue.currentPlayer = null;
                    this.play(guild).catch(e => {
                        queue.textChannel?.send({ embeds: [createEmbed("error", `Error while trying to play music\nReason: \`${e}\``)] })
                            .catch(e => console.error("PLAY_ERR:", e));
                        queue.connection?.disconnect();
                        return console.error("PLAY_ERR:", e);
                    });
                });
                return undefined;
            }
        })
    }

    private async handlePlaylist(url: string, message: Message, voiceChannel: VoiceChannel | StageChannel) {
        const playlist = await YouTube.getPlaylist(url);
        const videos = await playlist.getVideos();

        const addingPlaylistEmbed = createEmbed("info")
            .addField('Tracks', playlist.itemCount.toString(), true)
            .addField('Author', playlist.author.name!, true)
            .setThumbnail(playlist.bestThumbnailURL!)
            .setTitle(`Adding Playlist ${playlist.title}`)
            .setFooter(`Requested by ${message.member?.displayName}`)
            .setTimestamp(Date.now())

        const addingPlaylistVideoMessage = await message.channel.send({ embeds: [addingPlaylistEmbed] });
    }
}

export { Play as PlayCommand };
