import { NftError } from ".";

class LayerNameError extends NftError {
    constructor(
        message = "Layer name invalid. Name must be a folder name safe string."
    ) {
        super(message);
    }
}

export default LayerNameError;
