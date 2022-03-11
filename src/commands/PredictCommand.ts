import _ from "lodash";
import Command, { CommandHandler } from "./Command";
import { DEFAULT_AMOUNT } from "../config/constants";
import { getCollectionConfig, getLayerAmounts, printAmounts } from "../utils";

interface Positionals {
    collection: string;
    amount: number;
}

class PredictCommand extends Command<Positionals> {
    constructor() {
        super(
            "predict <collection> [amount]",
            "Calculates the expected amount of NFTs each layer will be apart of.",
            {
                collection: { type: "string", desc: "Collection name" },
                amount: {
                    type: "number",
                    desc: "The desired amount of NFTs to generate. May be rounded up if the rarity is not evenly divisible by the amount.",
                    default: DEFAULT_AMOUNT,
                },
            }
        );
    }

    public handler: CommandHandler<Positionals> = (args) => {
        const { amount } = args;
        const collection = getCollectionConfig(args.collection);
        const amounts = getLayerAmounts(collection, amount);

        printAmounts(amounts);
    };
}

export default PredictCommand;
