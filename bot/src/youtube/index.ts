import { getInfo } from 'ytdl-core';

import { Video } from './video';
import { Playlist  } from './playlist';
import { resolveYTPlaylistID } from './utils/resolve-url';
import ytpl from 'ytpl';
import ytsr, { Video as IVideo } from "ytsr";

export * from './item';
export * from './video';
export * from './playlist';

class YouTube {
    public static async getVideo(url: string): Promise<Video> {
        try {
            const data = await getInfo(url);
            return new Video(data, "ytdl");
        } catch (error: any) {
            throw new Error("Could not get video data");
        }
    }

    public static async getPlaylist(url: string): Promise<Playlist> {
        try {
            const id = resolveYTPlaylistID(url);
            if (!id) throw new Error(`Could not extract Playlist ID from url, URL is: ${url}`);
            const data = await ytpl(id);
            return new Playlist(data, "normal");
        } catch (error: any) {
            throw new Error(`Could not get playlist data`);
        }
    }

    public static async searchVideos(query: string, maxResults = 10): Promise<Video[]> {
        try {
            const data = await ytsr(query, { limit: maxResults, safeSearch: false });
            return data.items.filter(x => x.type === "video").map(i => new Video(i as IVideo, "normal"));
        } catch (error: any) {
            throw new Error(`Could not get search data`);
        }
    }
}

export { YouTube };
