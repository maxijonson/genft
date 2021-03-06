import fs from "fs";
import path from "path";
import Command, { CommandHandler } from "./Command";
import {
    getCollectionConfig,
    isFolderNameSafe,
    Logger,
    saveConfig,
} from "../utils";
import {
    CollectionAlreadyExistsError,
    CollectionNameError,
    FileNotFoundError,
    FileTypeError,
    LayerAlreadyExistsError,
    LayerNameError,
} from "../errors";
import {
    DEFAULT_RARITY,
    LAYERS_FOLDER,
    LAYER_EXT,
    NFTS_FOLDER,
} from "../config/constants";
import { Collection } from "../types";

interface Positionals {
    collection: string;
    layer?: string;
    file?: string;
}

class CreateCommand extends Command<Positionals> {
    constructor() {
        super(
            "create <collection> [layer] [file]",
            "Create a new collection, layer type or layer.\nWhen creating a collection, a folder will be created at the current working directory.",
            {
                collection: { type: "string", desc: "Collection name" },
                layer: { type: "string", desc: "Layer name" },
                file: {
                    type: "string",
                    desc: `File(s) or directory containing the ${LAYER_EXT} assets of the layer`,
                    normalize: true,
                },
            }
        );
    }

    public handler: CommandHandler<Positionals> = (args) => {
        const { layer, file } = args;
        let collection: Collection;
        const collectionPath = path.resolve(process.cwd(), args.collection);
        const collectionName = path.basename(collectionPath);

        if (!isFolderNameSafe(collectionName)) {
            throw new CollectionNameError();
        }

        // Check if the collection exists. If it doesn't create a folder for it with a config.json file.
        if (!fs.existsSync(collectionPath)) {
            fs.mkdirSync(collectionPath, { recursive: true });
            fs.mkdirSync(path.join(collectionPath, LAYERS_FOLDER));
            fs.mkdirSync(path.join(collectionPath, NFTS_FOLDER));
            collection = {
                name: collectionName,
                layerOrder: [],
                layerGroups: {},
            };
            Logger.success(`Created collection '${collectionName}'`);
            if (!layer) {
                saveConfig(collectionPath, collection);
            }
        } else {
            collection = getCollectionConfig(collectionPath);
            if (!layer && !file) throw new CollectionAlreadyExistsError();
        }

        try {
            if (layer) {
                if (!isFolderNameSafe(layer)) {
                    throw new LayerNameError();
                }
                if (collection.layerGroups[layer] && !file) {
                    throw new LayerAlreadyExistsError();
                }
                if (!collection.layerGroups[layer]) {
                    fs.mkdirSync(
                        path.join(collectionPath, LAYERS_FOLDER, layer)
                    );
                    collection.layerGroups[layer] = {
                        rarity: DEFAULT_RARITY,
                        required: true,
                        layers: [],
                    };
                    collection.layerOrder.push(layer);
                    Logger.success(`Created layer group '${layer}'`);
                }

                if (file) {
                    const filePath = path.resolve(process.cwd(), file);
                    if (!fs.existsSync(filePath)) {
                        throw new FileNotFoundError();
                    }
                    const isDirectory = fs.lstatSync(filePath).isDirectory();
                    const files = isDirectory
                        ? fs
                              .readdirSync(filePath)
                              .map((f) => path.join(filePath, f))
                        : [filePath];
                    const pngFiles = files.filter((f) => f.endsWith(LAYER_EXT));
                    if (pngFiles.length === 0) {
                        throw new FileTypeError();
                    }

                    pngFiles.forEach((f) => {
                        const layerName = path.basename(f, LAYER_EXT);
                        fs.copyFileSync(
                            f,
                            path.join(
                                collectionPath,
                                LAYERS_FOLDER,
                                layer,
                                layerName + LAYER_EXT
                            )
                        );
                        collection.layerGroups[layer]?.layers.push({
                            name: layerName,
                            rarity: DEFAULT_RARITY,
                        });
                    });
                    Logger.success(
                        `Added ${pngFiles.length} layer(s) to '${layer}'`
                    );
                }
            }
        } catch (e) {
            saveConfig(collectionPath, collection);
            throw e;
        }

        saveConfig(collectionPath, collection);
    };
}

export default CreateCommand;
