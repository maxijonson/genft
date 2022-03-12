import _ from "lodash";
import LayerGroup from "./LayerGroup";

export default interface Collection {
    name: string;
    layerOrder: (string | string[])[];
    layerGroups: { [group: string]: LayerGroup };
}
