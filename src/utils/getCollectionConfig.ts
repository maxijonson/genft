import fs from "fs";
import path from "path";
import {
    CollectionConfigMissingError,
    CollectionNotFoundError,
} from "../errors";

export default (collection: string) => {
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
