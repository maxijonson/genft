export default (layerName: string) => {
    if (layerName.length === 0) return false;

    // Regex to validate folder name
    const regex = /^[a-zA-Z0-9_-]+$/;
    return regex.test(layerName);
};
