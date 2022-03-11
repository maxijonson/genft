import { NftError } from ".";

class OptionError extends NftError {
    constructor(message = "Options are invalid.") {
        super(message);
    }
}

export default OptionError;
