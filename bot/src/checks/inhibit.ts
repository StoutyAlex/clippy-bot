import { Message } from "discord.js";
import { Command } from "../base/command";
import { ICommand } from "../types";

const Inhibit = (func: ICommand["run"]) => {
    return function decorate(target: unknown, key: string | symbol, descriptor: PropertyDescriptor): any {
        const original = descriptor.value;

        descriptor.value = async function (message: Message, ...args: string[]): Promise<any> {
            const result = await func(message, args);
            if (result === undefined) return original.apply(this, [message, args]);
            return null;
        };

        return descriptor;
    };
}

export { Inhibit };