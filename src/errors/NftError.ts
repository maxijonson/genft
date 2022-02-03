import chalk from "chalk";

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
        console.error(
            chalk.red(
                `${this.constructor.name}: ${this.message}${
                    process.env.NODE_ENV === "development"
                        ? ` (${chalk.bold(at)})`
                        : ""
                }`
            )
        );
    }
}

export default NftError;
