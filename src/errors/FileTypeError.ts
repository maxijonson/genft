import { NftError } from ".";
import { LAYER_EXT } from "../config/constants";

class FileTypeError extends NftError {
    constructor(message = `File(s) must be "${LAYER_EXT}" type.`) {
        super(message);
    }
}

export default FileTypeError;
