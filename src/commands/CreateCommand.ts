import fs from "fs";
import path from "path";
import Command, { CommandHandler } from "./Command";
import {
    CollectionConfig,
    getCollectionConfig,
    isFolderNameSafe,
    validateConfig,
} from "../utils";
import { CollectionAlreadyExistsError, CollectionNameError } from "../errors";

interface Args {
    collection: string;
    layer?: string;
    file?: string;
}

class CreateCommand extends Command<Args> {
    constructor() {
        super(
            "create <collection> [layer] [file]",
            "Create a new collection, layer type or layer.\nWhen creating a collection, a folder will be created at the current working directory.",
            {
                collection: { type: "string", desc: "Collection name" },
                layer: { type: "string", desc: "Layer name" },
                file: {
                    type: "string",
                    desc: "File(s) or directory containing the .png assets of the layer",
                    normalize: true,
                },
            }
        );
    }

    public handler: CommandHandler<Args> = (args) => {
        const { collection, layer, file } = args;
        let collectionConfig: CollectionConfig;

        if (!isFolderNameSafe(collection)) {
            throw new CollectionNameError();
        }

        // Check if the collection exists. If it doesn't create a folder for it with a config.json file.
        if (!fs.existsSync(path.join(process.cwd(), collection))) {
            fs.mkdirSync(path.join(process.cwd(), collection));
            fs.mkdirSync(path.join(process.cwd(), collection, "layers"));
            fs.mkdirSync(path.join(process.cwd(), collection, "nfts"));
            collectionConfig = {
                name: collection,
                layerOrder: [],
                layerGroups: {},
            };
            fs.writeFileSync(
                path.join(process.cwd(), collection, "config.json"),
                JSON.stringify(collectionConfig, null, 4)
            );
        } else {
            collectionConfig = getCollectionConfig(collection);
            if (!layer && !file) throw new CollectionAlreadyExistsError();
        }

        validateConfig(collection, collectionConfig);
    };
}

export default CreateCommand;
