import fs from "fs";
import path from "path";
import {
    CollectionConfigMissingError,
    CollectionNotFoundError,
} from "../errors";
import { Collection } from "../types";

export default (collectionPath: string): Collection => {
    const configPath = path.join(collectionPath, "config.json");

    if (!fs.existsSync(collectionPath)) {
        throw new CollectionNotFoundError(collectionPath);
    }
    if (!fs.existsSync(configPath)) {
        throw new CollectionConfigMissingError(collectionPath);
    }

    return JSON.parse(fs.readFileSync(configPath, "utf8"));
};
