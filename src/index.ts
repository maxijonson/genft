#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Command from "./commands/Command";
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

        let y = yargs(hideBin(process.argv))
            .scriptName("nft-generator")
            .command("$0", "Interactive Mode", {}, () => {
                console.info("Interactive Mode");
            });

        commands.forEach((command) => {
            y = y.command(
                command.getCommand(),
                command.getDescription(),
                command.getBuilder(),
                command.handler
            );
        });

        const { argv: _argv } = y;
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
