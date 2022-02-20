import fs from "fs";
import path from "path";
import { Logger } from ".";
import { Collection } from "../types";

export default (collectionPath: string, config: Collection) => {
    fs.writeFileSync(
        path.join(collectionPath, "config.json"),
        JSON.stringify(config, null, 4)
    );
    Logger.success("Configuration saved");
};
