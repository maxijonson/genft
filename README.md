# GeNFT

Generate an NFT collection in a blink! Just give the layers and it'll generate multiple combinations of these layers. Additionally, you can control the rarity of each layer.

The tool is pretty minimal at the moment and is still a work in progress. One of the main issues right now is dealing with rounding the amounts of layers. However, the tool is capable of generating collections successfully, just not with a 100% accurate prediction of the amount of layers. You can check out the collection that was created during development on [OpenSea](https://opensea.io/collection/logical-gates).

## How it works

Import multiple layers that can be stacked together to create an NFT. GeNFT will generate a collection of NFTs based on the configuration file that you can configure. Other use cases could be just simple compositing of images, since that's what most NFTs are anyways!

## Installation

Currently, GeNFT is only available as a CLI tool using NPM. In the future, I would like the commands to be exported into a module and possibly add a GUI tool for better user experience when editing the config file.

```bash
npm i -g genft
```

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

## Other commands

At any time, you may use the following command to view its syntax:

```bash
genft --help
genft <command> --help
```
