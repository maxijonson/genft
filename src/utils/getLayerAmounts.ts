import _ from "lodash";
import { DEFAULT_RARITY } from "../config/constants";
import { GeneratorError } from "../errors";
import { Amounts, Collection } from "../types";

/**
 * Infers the rarity of a layer group or layer in a layer group
 */
const getAutoRarity = (layers: { rarity: number }[]) => {
    let autoCount = 0;
    let remaining = 1;

    _.forEach(layers, (layer) => {
        if (layer.rarity === 0) {
            autoCount++;
        }
        remaining -= layer.rarity;
    });

    return remaining / autoCount;
};

/**
 * Gets or infers the rarity of a layer group or layer in a layer group
 */
const getRarity = (
    collection: Collection,
    order: number,
    layerGroup: string,
    layer?: string
) => {
    const layerOrder = collection.layerOrder[order];
    if (!layerOrder) {
        throw new GeneratorError(
            `getRarity - Order index ${order} is out of bounds`
        );
    }

    const layerGroupConfig = collection.layerGroups[layerGroup];
    if (!layerGroupConfig) {
        throw new GeneratorError(
            `getRarity - Layer group ${layerGroup} does not exist`
        );
    }
    const layerGroupRarity = (() => {
        const { rarity } = layerGroupConfig;

        if (typeof layerOrder === "string") {
            if (rarity === DEFAULT_RARITY) return 1; // Single layer on the order with auto rarity is 1
            return rarity; // Use the specified rarity
        }

        // Multiple layers in the order
        if (rarity !== DEFAULT_RARITY) return rarity; // Use the specified rarity
        return getAutoRarity(
            layerOrder.map((lo) => {
                const group = collection.layerGroups[lo];
                if (!group) {
                    throw new GeneratorError(
                        `getRarity - Layer group ${lo} does not exist`
                    );
                }
                return group;
            })
        );
    })();

    if (!layer) return layerGroupRarity;

    const layerConfig = layerGroupConfig.layers.find((l) => l.name === layer);
    if (!layerConfig) {
        throw new GeneratorError(
            `getRarity - Layer ${layer} does not exist in layer group ${layerGroup}`
        );
    }

    if (layerConfig.rarity !== DEFAULT_RARITY) {
        return layerConfig.rarity * layerGroupRarity;
    }
    return getAutoRarity(layerGroupConfig.layers) * layerGroupRarity;
};

/**
 * Calculates the amount of each layer in a layer group (defined by `layerOrder`)
 */
const populateAmounts = (
    amounts: Amounts,
    amount: number,
    collection: Collection,
    layerOrder: string,
    orderIndex: number
) => {
    const layerGroup = collection.layerGroups[layerOrder];
    if (!layerGroup) {
        throw new GeneratorError(`Layer group '${layerOrder}' not found`);
    }

    amounts[layerOrder] = {}; // Note: This implies that each layerGroup name in layerOrder appears only once
    _.forEach(layerGroup.layers, (layer) => {
        const layerAmount =
            getRarity(collection, orderIndex, layerOrder, layer.name) * amount;
        amounts[layerOrder]![layer.name] = {
            value: Math.ceil(layerAmount),
            rounded: layerAmount % 1 !== 0,
        };
    });
};

export default (collection: Collection, amount: number) =>
    _.reduce(
        collection.layerOrder, // Only find amounts for layers that will actually be used
        (amounts, layerOrder, orderIndex) => {
            _.forEach(
                typeof layerOrder === "string" ? [layerOrder] : layerOrder,
                (order) => {
                    populateAmounts(
                        amounts,
                        amount,
                        collection,
                        order,
                        orderIndex
                    );
                }
            );

            return amounts;
        },
        {} as Amounts
    );
