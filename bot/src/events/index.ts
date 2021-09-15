import { ClientEvents } from "discord.js";
import { Event } from "../base/event";
import { VoiceState } from "./voice-state";
import { MessageEvent } from './message';

const events: {[property in keyof Partial<ClientEvents>]: typeof Event} = {
    'voiceStateUpdate': VoiceState,
    'messageCreate': MessageEvent,
};

export { events };
