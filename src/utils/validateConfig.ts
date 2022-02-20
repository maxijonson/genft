import _ from "lodash";
import fs from "fs";
import path from "path";
import { CollectionConfigError } from "../errors";
import { Collection } from "../types";
import { isFolderNameSafe } from ".";

export default (collectionPath: string, config: Collection) => {
    const { layerGroups, layerOrder } = config;

    if (!fs.existsSync(collectionPath)) {
        throw new CollectionConfigError("Collection folder does not exist.");
    }

    if (!_.isArray(layerOrder)) {
        throw new CollectionConfigError("layerOrder is not an array.");
    }
    if (!_.isObject(layerGroups)) {
        throw new CollectionConfigError("layerGroups is not an object.");
    }

    _.forEach(layerGroups, (group, groupName) => {
        if (!isFolderNameSafe(groupName)) {
            throw new CollectionConfigError(
                `Layer name '${groupName}' is not a folder name safe string.`
            );
        }
        if (!fs.existsSync(path.join(collectionPath, "layers", groupName))) {
            throw new CollectionConfigError(
                `Layer '${groupName}' does not exist in collection's 'layers' folder.`
            );
        }
        if (typeof group.rarity !== "number") {
            throw new CollectionConfigError(
                `Layer group '${groupName}' has a non-number rarity.`
            );
        }
        if (group.rarity < 0 || group.rarity > 1) {
            throw new CollectionConfigError(
                `Layer group '${groupName}' has a rarity of ${group.rarity} which is not between 0 and 1.`
            );
        }
        if (!_.isArray(group.layers)) {
            throw new CollectionConfigError(
                `Layer group '${groupName}' layers is not an array.`
            );
        }

        const usedLayers: string[] = [];
        let hasAutoLayer = false;
        let raritySum = 0;
        group.layers.forEach((layer, i) => {
            if (typeof layer.name !== "string") {
                throw new CollectionConfigError(
                    `${groupName}'s layer #${i + 1} name is not a string.`
                );
            }
            if (usedLayers.indexOf(layer.name) !== -1) {
                throw new CollectionConfigError(
                    `${groupName}'s '${layer.name}' layer is duplicated.`
                );
            }
            usedLayers.push(layer.name);
            if (typeof layer.rarity !== "number") {
                throw new CollectionConfigError(
                    `${groupName}'s '${layer.name}' layer has a non-number rarity.`
                );
            }
            if (layer.rarity < 0 || layer.rarity > 1) {
                throw new CollectionConfigError(
                    `${groupName}'s '${layer.name}' layer has a rarity of ${group.rarity} which is not between 0 and 1.`
                );
            }
            if (layer.rarity === 0) {
                hasAutoLayer = true;
            }
            raritySum += layer.rarity;
        });

        if (
            raritySum > 1 ||
            (!hasAutoLayer && raritySum !== 1 && group.layers.length > 1)
        ) {
            throw new CollectionConfigError(
                `${groupName}'s layers rarity do not add up to 1. Use 0 on at least one layer to make its rarity automatic or make sure their rarity sum is equal to 1.`
            );
        }
    });

    const usedLayerOrder: string[] = [];
    _.forEach(layerOrder, (order) => {
        if (typeof order === "string") {
            if (!layerGroups[order]) {
                throw new CollectionConfigError(
                    `Found layerOrder '${order}', but that name does not exist in layerGroups.`
                );
            }
            if (usedLayerOrder.indexOf(order) !== -1) {
                throw new CollectionConfigError(
                    `Found layer '${order}' in layerOrder more than once.`
                );
            }
            usedLayerOrder.push(order);
        } else if (Array.isArray(order)) {
            if (order.length < 2) {
                throw new CollectionConfigError(
                    `Found layerOrder '${order}' as single element. Remove the array and use the layer name or add more layers to the array.`
                );
            }
            let raritySum = 0;
            _.forEach(order, (layer) => {
                if (typeof layer !== "string") {
                    throw new CollectionConfigError(
                        "layerOrder elements defined as an array must be an array of strings."
                    );
                }
                const layerGroup = layerGroups[layer];
                if (!layerGroup) {
                    throw new CollectionConfigError(
                        `layerOrder '${layer}' does not exist in layerGroups.`
                    );
                }
                if (usedLayerOrder.indexOf(layer) !== -1) {
                    throw new CollectionConfigError(
                        `layerOrder '${layer}' is found more than once.`
                    );
                }
                usedLayerOrder.push(layer);
                raritySum += layerGroup.rarity;
            });
            if (raritySum > 1) {
                throw new CollectionConfigError(
                    `'${order.join(
                        ", "
                    )}' layers do not add up to 1. Use 0 on at least one layer to make it's rarity automatic or make sure their rarity sum is equal to 1.`
                );
            }
        } else {
            throw new CollectionConfigError(
                "layerOrder element is neither a string or an array."
            );
        }
    });
};
