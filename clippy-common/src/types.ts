import { PutEventsRequestEntry } from "aws-sdk/clients/eventbridge";
import { Message } from "discord.js";

export interface MessageEvent extends PutEventsRequestEntry {
    Source: 'DiscordBot',
    DetailType: 'MessageReceived',
};

export interface MessageEventDetail {
    message: Message
};
