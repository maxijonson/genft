import chalk from "chalk";

class NftError extends Error {
    constructor(message = "Unexpected error.") {
        super(message);
    }

    public print() {
        const at = this.stack?.split("\n")[1]?.split("at ")[1] ?? "";
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
