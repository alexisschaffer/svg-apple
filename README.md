# SVG Apple Optimizer

A Node.js console application that optimizes SVG files for Apple brand compliance using the SVGO library.

## Features

- **Apple Brand Compliance**: Optimizes SVG files according to Apple's brand guidelines
- **Square Aspect Ratio**: Automatically ensures 1:1 aspect ratio with 5% padding for optimal Apple asset formatting
- **Style Normalization**: Converts CSS `style` attributes to standard attributes
- **High Compression**: Achieves significant file size reduction while maintaining quality
- **Validation**: Built-in compliance checking for Apple brand standards
- **Flexible Output**: Supports custom output paths and directories
- **CLI Interface**: Easy-to-use command-line interface
- **Global Binary**: Can be installed globally as `svg-apple` command

## Installation

### Local Installation

```bash
npm install
```

### Global Installation

```bash
npm install -g .
```

After global installation, you can use the `svg-apple` command directly.

## Usage

### Basic Usage

```bash
# Using Node.js directly
node index.js input.svg

# Using global command (after global installation)
svg-apple input.svg
```

This will create an optimized file named `input-apple-optimized.svg` in the current directory.

### Advanced Usage

```bash
# Specify custom output file
node index.js input.svg -o output.svg
svg-apple input.svg -o output.svg

# Output to a directory
node index.js input.svg -o ./optimized/
svg-apple input.svg -o ./optimized/

# Preserve viewBox for scalability
node index.js input.svg --preserve-viewbox
svg-apple input.svg --preserve-viewbox

# Validate Apple brand compliance
node index.js input.svg --validate
svg-apple input.svg --validate

# Combine options
node index.js input.svg -o ./output/ --validate --preserve-viewbox
svg-apple input.svg -o ./output/ --validate --preserve-viewbox
```

### Command Line Options

- `-o, --output <path>`: Output file path or directory
- `--preserve-viewbox`: Preserve viewBox attribute for scalability
- `--validate`: Validate Apple brand compliance after optimization
- `-h, --help`: Display help information
- `-V, --version`: Output version number

## Apple Brand Compliance Features

The optimizer applies the following Apple-compliant optimizations:

### Automatic Formatting

- **Square Aspect Ratio**: Converts any SVG to a 1:1 aspect ratio with 5% padding for optimal Apple asset presentation
- **Responsive Sizing**: Removes fixed width/height attributes to make SVGs fully responsive
- **Content Centering**: Automatically centers content within the square viewBox

### Style Normalization

- **Fill Attribute Conversion**: Converts CSS `style="fill: color"` attributes to standard `fill="color"` attributes
- **Style Cleanup**: Removes empty or redundant style attributes after conversion

### Standard Optimizations

- **Removes unnecessary metadata** and comments
- **Cleans up attributes** and removes unused namespaces
- **Optimizes path data** with precision suitable for brand assets
- **Removes raster images** (not suitable for scalable brand assets)
- **Removes empty elements** and containers
- **Optimizes transformations** with appropriate precision
- **Sorts attributes** for consistent output
- **Removes disallowed elements** like script and style tags
- **Removes event handlers** and interactive attributes
- **Ensures proper SVG namespace** declaration

## Validation Warnings

The validator checks for:

- Presence of raster images
- Embedded data URIs
- Style tags (prefers inline styles)
- Missing viewBox attributes

## Example

```bash
# Input SVG: 1,090 bytes
# Output SVG: 203 bytes (81.4% reduction)
node index.js test-sample.svg --validate

# Or using global command
svg-apple test-sample.svg --validate
```

The optimizer will automatically:

- Convert the SVG to a perfect square (1:1 aspect ratio) with 5% padding
- Center the original content within the square
- Convert any `style="fill: #color"` to `fill="#color"` attributes
- Remove all non-compliant elements and attributes
- Optimize the SVG for maximum compression while maintaining quality

## Dependencies

- `svgo`: SVG optimization engine
- `commander`: CLI framework
- `chalk`: Terminal styling

## License

MIT - see [LICENSE](LICENSE) file for details
