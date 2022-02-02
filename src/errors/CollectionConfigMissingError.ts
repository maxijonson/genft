import { NftError } from ".";

class CollectionConfigMissingError extends NftError {
    constructor(
        collection?: string,
        message = `Collection ${collection} does not have a config.json file. It may not be an NFT collection folder, may be corrupted or the collection was not created using the commands.`
    ) {
        super(message);
    }
}

export default CollectionConfigMissingError;
