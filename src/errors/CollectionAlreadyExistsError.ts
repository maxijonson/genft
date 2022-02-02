import { NftError } from ".";

class CollectionAlreadyExistsError extends NftError {
    constructor(message = "Collection already exists.") {
        super(message);
    }
}

export default CollectionAlreadyExistsError;
