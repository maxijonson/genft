#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Command from "./commands/Command";
import { CLI_NAME } from "./config/constants";
import { handleError } from "./utils";

(async () => {
    try {
        // Load all commands from the commands directory, except the Command.ts file
        const commandFiles = fs
            .readdirSync(path.join(__dirname, "commands"))
            .reduce((acc, file) => {
                if (file.split(".")[0] !== "Command") {
                    acc.push(file);
                }
                return acc;
            }, [] as string[]);

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
        handleError(e);
    }
})();
