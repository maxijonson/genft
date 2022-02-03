import { NftError } from ".";

class CollectionConfigError extends NftError {
    constructor(
        details = "",
        message = "The collection config file is invalid. This usually happens when you manually edit names (either in the config file or in the folder structure) without using the 'rename' command. You can use the 'sync' command to rebuild the config file."
    ) {
        super(`${message}${details ? `\nDetails: ${details}` : ""}`);
    }
}

export default CollectionConfigError;
