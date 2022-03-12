import _ from "lodash";
import fs from "fs";
import path from "path";
import Joi from "joi";
import { CollectionConfigError } from "../errors";
import { Collection } from "../types";

const safeName = Joi.string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .min(1);
const layerName = safeName.label("Layer name");
const nameSchema = safeName.required().label("Collection name");
const rarity = Joi.number().min(0).max(1);

const layerGroupsSchema = Joi.object()
    .pattern(
        safeName,
        Joi.object({
            rarity: rarity.required(),
            layers: Joi.array()
                .items(
                    Joi.object({
                        name: Joi.string()
                            .regex(/^[a-zA-Z0-9_-\s]+$/)
                            .min(1)
                            .required(),
                        rarity: rarity.required(),
                    })
                )
                .unique((a, b) => a.name === b.name)
                .required(),
        })
    )
    .required()
    .label("Layer groups");

const layerOrderSchema = Joi.array()
    .items(layerName, Joi.array().items(layerName).unique().min(2))
    .unique((a, b) => {
        // Make sure a layer never appears twice in the layerOrder
        // This would be a nice feature to have, but it would make it too complicated to calculate the amounts
        if (typeof a === "string" && typeof b === "object") {
            return b.includes(a);
        }
        if (typeof a === "object" && typeof b === "string") {
            return a.includes(b);
        }
        if (typeof a === "object" && typeof b === "object") {
            return a.some((x: string) => b.includes(x));
        }
        return a === b;
    })
    .min(1)
    .required()
    .label("Layer order");

const collectionSchema = Joi.object({
    name: nameSchema,
    layerOrder: layerOrderSchema,
    layerGroups: layerGroupsSchema,
})
    // Make sure each layer order are in the layerGroups
    .custom((value: Collection) => {
        const { layerOrder, layerGroups } = value;
        layerOrder.forEach((layer: Collection["layerOrder"][0]) => {
            const v = typeof layer === "string" ? [layer] : layer;
            v.forEach((name) => {
                if (!layerGroups[name]) {
                    throw new Error(
                        `layer order '${name}' is not in the collection's layer groups.`
                    );
                }
            });
        });
        return value;
    }, "Layer order in layer groups")
    // Make sure rarity sum does not exceed 1
    // Also make sure auto layers (rarity 0) have sufficient rarity left to fill the rest
    .custom((value: Collection) => {
        _.forEach(value.layerOrder, (order) => {
            if (typeof order === "string") return; // Single layers may have any rarity (rarity 0 is 1)
            let hasAutoLayer = false;
            const sum = order.reduce((acc, group) => {
                const r = value.layerGroups[group]?.rarity ?? 0;
                if (r === 0) {
                    hasAutoLayer = true;
                }
                return acc + r;
            }, 0);
            if (sum > 1) {
                throw new Error(
                    `The sum of the layer groups' rarity in layer order "${order.join(
                        ", "
                    )}" must not exceed 1.`
                );
            }
            if (hasAutoLayer && sum === 1) {
                throw new Error(
                    `No remaining rarity for auto layers of layer order "${order.join(
                        ", "
                    )}".`
                );
            }
        });
        return value;
    }, "Layer groups rarity")
    // Make sure each layer group layers rarity sum is 1 or contains auto layer(s)
    // Also make sure auto layers (rarity 0) have sufficient rarity left to fill the rest
    .custom((value: Collection) => {
        _.forEach(value.layerGroups, (layerGroup, layerGroupName) => {
            let hasAutoLayer = false;
            const sum = layerGroup.layers.reduce((acc, layer) => {
                if (layer.rarity === 0) {
                    hasAutoLayer = true;
                }
                return acc + layer.rarity;
            }, 0);
            if (sum > 1) {
                throw new Error(
                    `The sum of the layers rarity in layer group "${layerGroupName}" must not exceed 1.`
                );
            }
            if (hasAutoLayer && sum === 1) {
                throw new Error(
                    `No remaining rarity for auto layers of layer group "${layerGroupName}".`
                );
            }
            if (!hasAutoLayer && sum !== 1) {
                throw new Error(
                    `The sum of the layers rarity in layer group "${layerGroupName}" must be 1 or contain at least one auto layer (rarity 0).`
                );
            }
        });
        return value;
    }, "Layers rarity")
    .label("Collection");

export default (collectionPath: string, config: Collection) => {
    const { layerGroups } = config;

    if (!fs.existsSync(collectionPath)) {
        throw new CollectionConfigError("Collection folder does not exist.");
    }

    const { error } = collectionSchema.validate(config);

    if (error) {
        throw new CollectionConfigError(error.message);
    }

    _.forEach(layerGroups, (group, groupName) => {
        const layerGroupPath = path.join(collectionPath, "layers", groupName);
        if (!fs.existsSync(layerGroupPath)) {
            throw new CollectionConfigError(
                `Layer '${groupName}' does not exist in collection's 'layers' folder.`
            );
        }

        group.layers.forEach((layer) => {
            const layerPath = path.join(layerGroupPath, `${layer.name}.png`);
            if (!fs.existsSync(layerPath)) {
                throw new CollectionConfigError(
                    `Layer '${layer.name}.png' does not exist in layer group '${groupName}' folder.`
                );
            }
        });
    });
};
