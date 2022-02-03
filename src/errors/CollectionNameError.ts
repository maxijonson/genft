import { NftError } from ".";

class CollectionNameError extends NftError {
    constructor(
        message = "Collection name invalid. Name must be a folder name safe string."
    ) {
        super(message);
    }
}

export default CollectionNameError;
