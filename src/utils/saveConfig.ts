import fs from "fs";
import path from "path";
import { Logger } from ".";
import { Collection } from "../types";

export default (config: Collection) => {
    fs.writeFileSync(
        path.join(process.cwd(), config.name, "config.json"),
        JSON.stringify(config, null, 4)
    );
    Logger.success("Configuration saved");
};
