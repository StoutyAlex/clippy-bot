import { EventName } from "../types";
import { SheevBot } from "./sheev-bot";

class Event {
    public client: SheevBot;
    public static eventName: EventName;

    constructor(client: SheevBot) {
        this.client = client;
    }

    async run(...args: any) {
        return;
    }
};

export { Event };