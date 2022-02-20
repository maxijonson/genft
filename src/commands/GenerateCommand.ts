import path from "path";
import fs from "fs";
import _ from "lodash";
import sharp from "sharp";
import {
    DEFAULT_AMOUNT,
    LAYERS_FOLDER,
    LAYER_EXT,
    MAX_TRIES,
    NFTS_FOLDER,
    NFT_EXT,
} from "../config/constants";
import { Amounts, Layer } from "../types";
import {
    getCollectionConfig,
    getLayerAmounts,
    Logger,
    validateConfig,
} from "../utils";
import Command, { CommandHandler } from "./Command";
import { GeneratorError } from "../errors";

interface Args {
    collection: string;
    amount: number;
}

interface ImageLayer {
    layerGroup: string;
    layer: Layer;
}

class GenerateCommand extends Command<Args> {
    constructor() {
        super(
            "generate <collection> [amount]",
            "Generate a fixed amount of NFTs for a collection",
            {
                collection: {
                    type: "string",
                    desc: "The name of the collection to generate",
                },
                amount: {
                    type: "number",
                    desc: "The amount of NFTs to generate",
                    default: DEFAULT_AMOUNT,
                },
            }
        );
    }

    private getNftName = (imageLayers: ImageLayer[]) => {
        const names: string[] = [];
        _.forEach(imageLayers, ({ layer, layerGroup }) => {
            names.push(`${layerGroup}-${layer.name}`);
        });
        return names.join("_");
    };

    public handler: CommandHandler<Args> = async (args) => {
        const { amount } = args;
        const collectionPath = path.resolve(process.cwd(), args.collection);
        const collection = getCollectionConfig(collectionPath);

        // Config errors past this point should be GeneratorErrors, not CollectionConfigErrors
        validateConfig(collectionPath, collection);

        const amounts: Amounts = getLayerAmounts(collection, amount);
        const { layerOrder } = collection;
        const nftNames = new Set<string>();
        const nfts: ImageLayer[][] = [];

        _.times(amount, () => {
            let tries = 0;

            while (tries < MAX_TRIES) {
                tries++;
                const imageLayers: ImageLayer[] = [];

                _.forEach(layerOrder, (order) => {
                    // Get the layer group name. If it's an array, choose a random one.
                    const layerGroupName =
                        typeof order === "string" ? order : _.sample(order);
                    if (!layerGroupName) {
                        throw new GeneratorError(
                            "Unexpected undefined layer group"
                        );
                    }

                    // Get the layer group object.
                    const layerGroup = collection.layerGroups[layerGroupName];
                    if (!layerGroup) {
                        throw new GeneratorError(
                            `Unexpected undefined layer group ${layerGroupName}`
                        );
                    }

                    // Choose a random layer from the layer group.
                    const layer = _.sample(layerGroup.layers);
                    if (!layer) {
                        throw new GeneratorError(
                            `Unexpected undefined layer in layer group ${layerGroupName}`
                        );
                    }

                    // Add the layer to the image layers.
                    imageLayers.push({ layerGroup: layerGroupName, layer });
                });

                const nftName = this.getNftName(imageLayers);
                if (nftNames.has(nftName)) {
                    if (tries === MAX_TRIES) {
                        throw new GeneratorError(
                            `Failed to generate unique NFT after ${MAX_TRIES} tries`
                        );
                    }
                    continue;
                }

                nftNames.add(nftName);
                nfts.push(imageLayers);

                // Reduce the amount of each layer in the image layers.
                _.forEach(imageLayers, ({ layer, layerGroup: lg }) => {
                    const layerGroup = collection.layerGroups[lg]!;
                    const layerAmount = amounts[lg]![layer.name]!;
                    layerAmount.value--;

                    // Remove the layer if it's "out of stock".
                    if (layerAmount.value === 0) {
                        const layerIndex = _.findIndex(
                            layerGroup.layers,
                            (l) => l.name === layer.name
                        );
                        layerGroup.layers.splice(layerIndex, 1);

                        // Remove the layer group if all of its layers have been used.
                        if (layerGroup.layers.length === 0) {
                            delete collection.layerGroups[lg];

                            // Also remove the layer group from the layer order.
                            _.forEach([...layerOrder], (order, i) => {
                                if (typeof order === "string") {
                                    if (order === lg) {
                                        layerOrder.splice(i, 1);
                                    }
                                } else {
                                    const index = order.indexOf(lg);
                                    if (index !== -1) {
                                        order.splice(index, 1);

                                        // Remove the layerOrder array if it's empty.
                                        if (order.length === 0) {
                                            layerOrder.splice(i, 1);
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
                break;
            }
        });

        const nftsPath = path.join(collectionPath, NFTS_FOLDER);
        if (fs.existsSync(nftsPath)) {
            fs.readdirSync(nftsPath).forEach((file) => {
                fs.unlinkSync(path.join(nftsPath, file));
            });
        } else {
            fs.mkdirSync(nftsPath);
        }

        const outputs = _.map(nfts, async (nftLayers) => {
            const nftName = this.getNftName(nftLayers);
            const outputPath = path.join(nftsPath, nftName + NFT_EXT);
            const layerPaths = _.map(nftLayers, ({ layer, layerGroup }) => {
                const layerPath = path.join(
                    collectionPath,
                    LAYERS_FOLDER,
                    layerGroup,
                    layer.name + LAYER_EXT
                );
                return layerPath;
            });
            const image = sharp(layerPaths[0]);
            image.composite(layerPaths.slice(1).map((p) => ({ input: p })));

            await image.toFile(outputPath);

            Logger.info(`Generated ${nftName}`);
        });

        await Promise.all(outputs);

        Logger.success(`Generated ${nfts.length} NFTs`);
    };
}

export default GenerateCommand;
