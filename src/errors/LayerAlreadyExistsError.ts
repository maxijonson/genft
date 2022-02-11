import { NftError } from ".";

class LayerAlreadyExistsError extends NftError {
    constructor(message = "Layer already exists.") {
        super(message);
    }
}

export default LayerAlreadyExistsError;
