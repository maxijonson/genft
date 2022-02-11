import { NftError } from ".";

class FileTypeError extends NftError {
    constructor(message = "File(s) must be PNG type.") {
        super(message);
    }
}

export default FileTypeError;
