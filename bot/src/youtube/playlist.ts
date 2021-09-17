import { Result as IPlaylist } from "ytpl";
import { Item, itemType } from "./Item";
import { Video } from "./Video";

class Playlist extends Item {
    public itemCount: number;
    
    constructor(public readonly raw: IPlaylist, protected readonly type: itemType) {
        super(raw, type);
        this.itemCount = raw.items.length;
    }

    public async getVideos(): Promise<Video[]> {
        return this.raw.items.map((i: any) => new Video(i, this.type));
    }
}

export { Playlist };
