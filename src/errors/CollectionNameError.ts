import { NftError } from ".";

class CollectionNameError extends NftError {
    constructor(message = "Collection name may not contain slashes.") {
        super(message);
    }
}

export default CollectionNameError;
