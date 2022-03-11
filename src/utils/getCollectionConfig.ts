import fs from "fs";
import path from "path";
import {
    CollectionConfigMissingError,
    CollectionNotFoundError,
} from "../errors";
import { Collection } from "../types";
import validateConfig from "./validateConfig";

export default (collectionPath: string): Collection => {
    const configPath = path.join(collectionPath, "config.json");

    if (!fs.existsSync(collectionPath)) {
        throw new CollectionNotFoundError(collectionPath);
    }
    if (!fs.existsSync(configPath)) {
        throw new CollectionConfigMissingError(collectionPath);
    }

    const collection = JSON.parse(fs.readFileSync(configPath, "utf8"));
    validateConfig(collectionPath, collection);
    return collection;
};
