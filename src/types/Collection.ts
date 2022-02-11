import LayerGroup from "./LayerGroup";

export default interface Collection {
    name: string;
    layerGroups: { [group: string]: LayerGroup };
    layerOrder: (string | string[])[];
}
