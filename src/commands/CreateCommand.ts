import fs from "fs";
import path from "path";
import Command, { CommandHandler } from "./Command";
import {
    getCollectionConfig,
    isFolderNameSafe,
    Logger,
    saveConfig,
    validateConfig,
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
    NFTS_FOLDER,
} from "../config/constants";
import { Collection } from "../types";

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
        let collectionConfig: Collection;
        const collectionPath = path.join(process.cwd(), collection);

        if (!isFolderNameSafe(collection)) {
            throw new CollectionNameError();
        }

        // Check if the collection exists. If it doesn't create a folder for it with a config.json file.
        if (!fs.existsSync(collectionPath)) {
            fs.mkdirSync(collectionPath);
            fs.mkdirSync(path.join(collectionPath, LAYERS_FOLDER));
            fs.mkdirSync(path.join(collectionPath, NFTS_FOLDER));
            collectionConfig = {
                name: collection,
                layerOrder: [],
                layerGroups: {},
            };
            Logger.success(`Created collection '${collection}'`);
            if (!layer) {
                saveConfig(collectionConfig);
            }
        } else {
            collectionConfig = getCollectionConfig(collection);
            if (!layer && !file) throw new CollectionAlreadyExistsError();
        }

        validateConfig(collection, collectionConfig);
        Logger.success("Configuration file is valid");

        try {
            if (layer) {
                if (!isFolderNameSafe(layer)) {
                    throw new LayerNameError();
                }
                if (collectionConfig.layerGroups[layer] && !file) {
                    throw new LayerAlreadyExistsError();
                }
                if (!collectionConfig.layerGroups[layer]) {
                    fs.mkdirSync(
                        path.join(collectionPath, LAYERS_FOLDER, layer)
                    );
                    collectionConfig.layerGroups[layer] = {
                        rarity: DEFAULT_RARITY,
                        layers: [],
                    };
                    collectionConfig.layerOrder.push(layer);
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
                    const pngFiles = files.filter((f) => f.endsWith(".png"));
                    if (pngFiles.length === 0) {
                        throw new FileTypeError();
                    }

                    pngFiles.forEach((f) => {
                        const layerName = path.basename(f, ".png");
                        fs.copyFileSync(
                            f,
                            path.join(
                                process.cwd(),
                                collection,
                                LAYERS_FOLDER,
                                layer,
                                layerName
                            )
                        );
                        collectionConfig.layerGroups[layer]?.layers.push({
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
            saveConfig(collectionConfig);
            throw e;
        }

        saveConfig(collectionConfig);
    };
}

export default CreateCommand;
