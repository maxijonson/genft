import fs from "fs";
import path from "path";
import {
    CollectionConfigMissingError,
    CollectionNotFoundError,
} from "../errors";
import { Collection } from "../types";

export default (collection: string): Collection => {
    const collectionPath = path.join(process.cwd(), collection);
    const configPath = path.join(collectionPath, "config.json");

    if (!fs.existsSync(collectionPath)) {
        throw new CollectionNotFoundError(collection);
    }
    if (!fs.existsSync(configPath)) {
        throw new CollectionConfigMissingError(collection);
    }

    return JSON.parse(fs.readFileSync(configPath, "utf8"));
};
