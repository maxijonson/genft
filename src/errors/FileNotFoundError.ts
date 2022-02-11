import { NftError } from ".";

class FileNotFoundError extends NftError {
    constructor(message = "File not found.") {
        super(message);
    }
}

export default FileNotFoundError;
