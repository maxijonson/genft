import Layer from "./Layer";

export default interface LayerGroup {
    rarity: number;
    required: boolean;
    layers: Layer[];
}
