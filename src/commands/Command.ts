import _ from "lodash";
import yargs from "yargs";

// Empty Object
type E = Record<string, never>;

export interface CommandHandler<P = E, O = E> {
    (args: yargs.ArgumentsCamelCase<P & O>): void | Promise<void>;
}

abstract class Command<P = E, O = E> {
    constructor(
        private command: string | readonly string[],
        private description: string,
        private positionals: {
            [key in keyof P]: yargs.PositionalOptions;
        } = {} as P,
        private options: { [key in keyof O]: yargs.Options } = {} as O
    ) {}

    public getCommand() {
        return this.command;
    }

    public getDescription() {
        return this.description;
    }

    public getBuilder(): yargs.BuilderCallback<P, P> {
        return (args) => {
            _.forEach(this.positionals, (pos, key) => {
                args.positional(key, pos);
            });
            _.forEach(this.options, (opt, key) => {
                args.option(key, opt);
            });
        };
    }

    public abstract handler: CommandHandler<P, O>;
}

export default Command;
