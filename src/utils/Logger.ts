import chalk from "chalk";

abstract class Logger {
    public static verbose = true;
    private static stopLoading: null | (() => void) = null;

    private static log = (
        message: string,
        type: "log" | "info" | "warn" | "error" = "log"
    ) => {
        if (!Logger.verbose) return;
        // eslint-disable-next-line no-console
        console[type](message);
    };

    public static info = (message: string) =>
        Logger.log(chalk.blue(`ℹ ${message}`), "info");

    public static warn = (message: string) =>
        Logger.log(chalk.yellow(`⚠ ${message}`), "warn");

    public static error = (message: string) =>
        Logger.log(chalk.red(`✖ ${message}`), "error");

    public static success = (message: string) =>
        Logger.log(chalk.green(`✔ ${message}`), "log");
}

export default Logger;
