import fs from "fs";
import path from "path";
import {
    CollectionConfigMissingError,
    CollectionNotFoundError,
} from "../errors";

export interface Layer {
    group: string;
    name: string;
    rarity: number;
}

export interface CollectionConfig {
    name: string;
    layers: { [group: string]: Layer[] };
}

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
