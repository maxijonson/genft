import { NftError } from "../errors";

export default (e: unknown) => {
    if (e instanceof NftError) {
        e.print();
    } else if (e instanceof Error) {
        new NftError(e.message).print();
        console.error(e);
    } else {
        new NftError().print();
        console.error(e);
    }
};
