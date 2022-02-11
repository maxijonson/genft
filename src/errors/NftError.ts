import chalk from "chalk";
import Logger from "../utils/Logger";

class NftError extends Error {
    constructor(message = "Unexpected error.") {
        super(message);
    }

    public print() {
        const at =
            this.stack
                ?.substring(this.stack.indexOf("\n    at "))
                .split("    at ")[1]
                ?.trim() ?? "";
        Logger.error(
            `${this.constructor.name}: ${this.message}${
                process.env.NODE_ENV === "development"
                    ? ` (${chalk.bold(at)})`
                    : ""
            }`
        );
    }
}

export default NftError;
