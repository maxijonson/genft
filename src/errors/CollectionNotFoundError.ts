import { NftError } from ".";

class CollectionNotFoundError extends NftError {
    constructor(
        collection?: string,
        message = `Collection ${collection ?? "(unknown)"} not found.`
    ) {
        super(message);
    }
}

export default CollectionNotFoundError;
