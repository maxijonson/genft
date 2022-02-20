import { NftError } from ".";

class GeneratorError extends NftError {
    constructor(message: string) {
        super(message);
    }
}

export default GeneratorError;
