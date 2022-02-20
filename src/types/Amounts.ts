export default interface Amounts {
    [layerGroup: string]: {
        [layer: string]: {
            value: number;
            rounded: boolean;
        };
    };
}
