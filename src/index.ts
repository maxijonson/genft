#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Command from "./commands/Command";
import { CLI_NAME } from "./config/constants";
import NftError from "./errors/NftError";

(async () => {
    try {
        // Load all commands from the commands directory, except the Command.ts file
        const commandFiles = fs.readdirSync(path.join(__dirname, "commands"));
        commandFiles.splice(commandFiles.indexOf("Command.ts"), 1);

        // Use import to load the commands
        const commands: Command<unknown>[] = await Promise.all(
            commandFiles.map(async (file) => {
                const command = await import(`./commands/${file}`);
                const C = command.default;
                return new C();
            })
        );

        yargs(hideBin(process.argv)).scriptName(CLI_NAME);

        commands.forEach((command) => {
            yargs.command(
                command.getCommand(),
                command.getDescription(),
                command.getBuilder(),
                command.handler
            );
        });

        // eslint-disable-next-line no-unused-expressions
        await yargs.demandCommand().wrap(yargs.terminalWidth()).argv;
    } catch (e) {
        if (e instanceof NftError) {
            e.print();
        } else if (e instanceof Error) {
            new NftError(e.message).print();
            console.error(e);
        } else {
            new NftError().print();
            console.error(e);
        }
    }
})();
