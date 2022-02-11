# GeNFT

Generate an NFT collection in a blink! Just give the layers and it'll generate multiple combinations of these layers. It doesn't stop here! You can also specify rarities for layer items!

## Prequisites

- git
- npm

## Installation

```bash
npm i -g genft
```

## Usage

Before running any of these commands, make sure your current working directory is BEFORE the collection(s) folder. Do not attempt to reference collecti

```bash
/documents/nft-collections $ ls

collection-1 collection-2 collection-3
```

### Generating NFTs

⚠ Never edit files manually (except the json configuration of the collection at step 3). Use the below commands instead. These commands make sure your configuration is kept in sync with the file structure. Manually making edits (such as changing file names) will break the generator ⚠

#### 1. Generate a collection

This will create a folder with a configuration file for the collection in your current working directory.

```bash
genft create <collection-name>

# genft create crypto-punks
```

#### 2. Add layers to the collection (.png)

⚠ Do not use layer names with slashes (/ or \\) in them. This will break the generator

Creates a layer folder in the collection's `layers` folder. If files or a directory is specified, all PNG files in the directory will be added to the collection.

```bash
genft create <collection-name> <layer-name> [file-or-dir-path]

# genft create crypto-punks hair
# genft create crypto-punks hair /pictures/hair
# genft create crypto-punks hair /pictures/hair/hair-1.png
```

#### 3. Configure the collection

For now, the only way to do this is to edit the JSON file in the generated collection directory.

#### 4. Generate NFTs

```bash
genft generate <collection-name>

# genft generate crypto-punks
```

### Other commands

#### Interactive mode

Not a fan of writing commands in the terminal? Use the interactive mode by running the program with no arguments.

```bash
genft
```

#### Sync a collection

This rebuilds the collection configuration. **This will erase any previous configuration, including your rarity settings. Use with caution!**

#### Delete a collection

```bash
genft delete <collection-name>

# genft delete crypto-punks
```

#### Delete a layer

```bash
genft delete <collection-name> <layer-name> [glob]

# genft delete crypto-punks hair
# genft delete crypto-punks hair hair-*.png
```

#### Change collection name

```bash
genft rename <collection-name> <new-collection-name>

# genft rename crypto-punks crypto-cats
```

#### Change layer name

```bash
genft rename <collection-name> <layer-name> [file] <new-layer-name>

# genft rename crypto-punks hair mustache
# genft rename crypto-punks hair hair-1.png hair1
# genft rename crypto-punks hair hair-1 hair1.png
```