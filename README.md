# GeNFT

Generate an NFT collection in a blink! Just give the layers and it'll generate multiple combinations of these layers. Additionally, you can control the rarity of each layer.

## 🛠 UNDER CONSTRUCTION 🛠

Generating collections work and you can follow the below instructions. However, the current version is not polished and there may be a lack of documentation.

## Installation

Currently, GeNFT is only available as a CLI tool using NPM.

```bash
npm i -g genft
```

## Usage

See [wiki](https://github.com/maxijonson/genft/wiki) for detailed usage documentation.

## Quick Start

### Create a collection

```bash
genft create my-collection
```

### Add some layer groups (`layerGroups`)

```bash
genft create my-collection body
genft create my-collection head
genft create my-collection eyes
genft create my-collection glasses
```

### Add layer files (`layerGroups.layers`)

```bash
# Add a folder of PNG files
genft create my-collection body /path/to/bodies/
genft create my-collection head /path/to/heads/

# Add individual PNG files
genft create my-collection eyes /path/to/eyes/eyes-1.png
genft create my-collection glasses /path/to/glasses/sunglasses.png
```

### Alternative: Create a collection, layer group and layer files all at once

```bash
genft create my-collection body /path/to/bodies/ # Creates the collection, the "body" layer group and imports the layer files
genft create my-collection head /path/to/heads/ # Creates the "head" layer group and imports the layer files
```

### Configure your collection

Currently, this can only be done by editing the `config.json` file in the collection's root folder. If you configure it wrong, you'll get a detailed error explaining you what is wrong in the configuration so you can fix it. Hopefully, this will be improved in the future.

#### Layer order

This specifies in which order the `layerGroup` should be placed. The elements can be either strings:

```json
{
    "layerOrder": ["body", "head", "eyes", "glasses"] // NFTs contain body, head, eyes, and glasses
}
```

or an array of more than 1 string:

```json
{
    "layerOrder": ["body", "head", ["eyes", "glasses"]] // NFTs contain body, head and either eyes OR glasses
}
```

#### Rarity

You can specify the rarity of each layer group as well as their layers' rarity. The rarity is a number between 0 and 1. 0 represents an 'auto' rarity, which means that its rarity will be calculated with the other 'auto' layers to be equally distributed. 1 means that the layer will always be present (or 100% of the amount desired).

#### 🤚 DO NO EDIT OTHER FIELDS 🛑

Only `layerOrder` and `rarity` fields should be edited. Layer group names and layer file names are automatically generated and tightly coupled to the file structure. You may edit them manually if you understand how they are being referenced. For example: editing a `layerGroup` name means you should also rename its folder.

### Generate NFTs

```bash
genft generate my-collection 100 # Generate 100 NFTs
```