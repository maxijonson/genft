import chalk from "chalk";
import _ from "lodash";
import { Amounts } from "../types";

export default (amounts: Amounts) => {
    _.forEach(amounts, (amountsByLayerGroup, layerGroup) => {
        let amountStr = "";
        let totalLayerAmt = 0;
        let roundedLayerAmt = 0;

        _.forEach(amountsByLayerGroup, (amt, layer) => {
            // Align the layer names to the longest layer name
            if (amt.rounded) {
                roundedLayerAmt += 1;
                amountStr += chalk.blue(
                    `\t- ${layer.padStart(20)}: ${amt.value}\n`
                );
            } else {
                amountStr += `\t- ${layer.padStart(20)}: ${amt.value}\n`;
            }
            totalLayerAmt += amt.value;
        });

        console.info(
            `${layerGroup}: ${totalLayerAmt}${
                roundedLayerAmt ? ` (${roundedLayerAmt} rounded)` : ""
            }`
        );
        console.info(amountStr);
    });
};
