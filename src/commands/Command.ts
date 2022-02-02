import _ from "lodash";
import yargs from "yargs";

export interface CommandHandler<A> {
    (args: yargs.ArgumentsCamelCase<A>): void | Promise<void>;
}

abstract class Command<A> {
    constructor(
        private command: string | readonly string[],
        private description: string,
        private builder: { [key in keyof A]: yargs.PositionalOptions }
    ) {}

    public getCommand() {
        return this.command;
    }

    public getDescription() {
        return this.description;
    }

    public getBuilder(): yargs.BuilderCallback<A, A> {
        return (args) => {
            _.forEach(this.builder, (opt, key) => {
                args.positional(key, opt);
            });
        };
    }

    public abstract handler: CommandHandler<A>;
}

export default Command;
