#!/usr/bin/env node

const { Command } = require('commander');
const { optimize } = require('svgo');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const program = new Command();

// Custom plugin to ensure 1:1 aspect ratio and center content
const ensureSquareAspectRatio = {
  name: 'ensureSquareAspectRatio',
  fn: () => {
    return {
      element: {
        enter: (node) => {
          if (node.name === 'svg') {
            // Get current viewBox or calculate from width/height
            let viewBox = node.attributes.viewBox;
            if (!viewBox) {
              const width = parseFloat(node.attributes.width) || 800;
              const height = parseFloat(node.attributes.height) || 800;
              viewBox = `0 0 ${width} ${height}`;
            }
            
            // Parse viewBox values
            const [x, y, w, h] = viewBox.split(' ').map(parseFloat);
            
            // Make it square (1:1 aspect ratio) by using the larger dimension + 5% padding
            const maxDimension = Math.max(w, h);
            const padding = maxDimension * 0.05; // 5% padding
            const size = maxDimension + (padding * 2); // Add padding to both sides
            
            // Center the content within the padded square
            const offsetX = (size - w) / 2;
            const offsetY = (size - h) / 2;
            
            // Update viewBox to be square, centered, and padded
            node.attributes.viewBox = `${x - offsetX} ${y - offsetY} ${size} ${size}`;
            
            // Remove width and height attributes to make it responsive
            delete node.attributes.width;
            delete node.attributes.height;
          }
        }
      }
    };
  }
};

const appleCompliantConfig = {
  plugins: [
    // Ensure 1:1 aspect ratio first
    ensureSquareAspectRatio,
    // Remove disallowed elements using removeUnknownsAndDefaults
    {
      name: 'removeUnknownsAndDefaults',
      params: {
        unknownContent: false,
        unknownAttrs: false,
        defaultAttrs: false,
        uselessOverrides: false,
        keepDataAttrs: false,
        keepAriaAttrs: false,
        keepRoleAttr: false
      }
    },
    
    // Remove disallowed attributes (but keep inline style attributes)
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          'accumulate', 'additive', 'begin', 'by', 'calcMode', 'filter',
          'from', 'href', 'keySplines', 'keyTimes', 'origin',
          'repeatCount', 'target', 'xlink:href'
        ]
      }
    },
    
    // Remove event handler attributes (on*)
    {
      name: 'removeAttrs',
      params: {
        attrs: '(on.*)'
      }
    },
    
    // Ensure proper SVG namespace
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: {
          xmlns: 'http://www.w3.org/2000/svg'
        }
      }
    },
    
    // Remove specific disallowed elements
    'removeScriptElement',
    'removeStyleElement',
    'convertStyleToAttrs',
    
    // Standard SVGO optimizations while maintaining compliance
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    'convertPathData',
    'convertTransform',
    'removeNonInheritableGroupAttrs',
    'removeUnusedNS',
    'cleanupNumericValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'mergePaths',
    'convertShapeToPath',
    'sortAttrs',
    'removeDimensions'
  ]
};

function validateSVG(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`Error: File "${filePath}" does not exist.`));
    process.exit(1);
  }

  const fileExtension = path.extname(filePath).toLowerCase();
  if (fileExtension !== '.svg') {
    console.error(chalk.red(`Error: File "${filePath}" is not an SVG file.`));
    process.exit(1);
  }
}

function generateOutputPath(inputPath, outputDir) {
  const baseName = path.basename(inputPath, '.svg');
  const outputFileName = `${baseName}-apple-optimized.svg`;
  return outputDir ? path.join(outputDir, outputFileName) : outputFileName;
}

async function optimizeSVG(inputPath, outputPath, options = {}) {
  try {
    console.log(chalk.blue(`Optimizing SVG for Apple brand compliance...`));
    console.log(chalk.gray(`Input: ${inputPath}`));
    console.log(chalk.gray(`Output: ${outputPath}`));

    const svgString = fs.readFileSync(inputPath, 'utf8');
    
    const config = options.preserveViewBox ? 
      { ...appleCompliantConfig, plugins: appleCompliantConfig.plugins.map(plugin => 
        plugin.name === 'removeViewBox' ? { ...plugin, active: false } : plugin
      )} : appleCompliantConfig;

    const result = optimize(svgString, {
      path: inputPath,
      ...config
    });

    if (result.error) {
      throw new Error(result.error);
    }

    const optimizedSVG = result.data;
    
    fs.writeFileSync(outputPath, optimizedSVG);

    const originalSize = Buffer.byteLength(svgString, 'utf8');
    const optimizedSize = Buffer.byteLength(optimizedSVG, 'utf8');
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

    console.log(chalk.green(`✓ SVG optimized successfully!`));
    console.log(chalk.yellow(`Original size: ${originalSize} bytes`));
    console.log(chalk.yellow(`Optimized size: ${optimizedSize} bytes`));
    console.log(chalk.yellow(`Size reduction: ${reduction}%`));
    console.log(chalk.green(`Apple-compliant SVG saved to: ${outputPath}`));

    if (options.validate) {
      validateAppleCompliance(optimizedSVG);
    }

  } catch (error) {
    console.error(chalk.red(`Error optimizing SVG: ${error.message}`));
    process.exit(1);
  }
}

function validateAppleCompliance(svgContent) {
  const issues = [];

  if (svgContent.includes('raster')) {
    issues.push('Contains raster images (not recommended for Apple brand assets)');
  }

  if (svgContent.includes('data:')) {
    issues.push('Contains embedded data URIs (may affect performance)');
  }

  if (svgContent.match(/<style[^>]*>/)) {
    issues.push('Contains style tags (prefer inline styles for Apple assets)');
  }

  if (!svgContent.includes('viewBox')) {
    issues.push('Missing viewBox attribute (recommended for scalability)');
  }

  if (issues.length > 0) {
    console.log(chalk.yellow('\n⚠️ Apple Brand Compliance Warnings:'));
    issues.forEach(issue => {
      console.log(chalk.yellow(`   • ${issue}`));
    });
  } else {
    console.log(chalk.green('\n✓ SVG passes basic Apple brand compliance checks'));
  }
}

program
  .name('svg-apple')
  .description('Optimizer for Apple SVG logos to ensure brand compliance')
  .version('0.1.0');

program
  .argument('<input>', 'Input SVG file path')
  .option('-o, --output <path>', 'Output file path or directory')
  .option('--preserve-viewbox', 'Preserve viewBox attribute for scalability')
  .option('--validate', 'Validate Apple brand compliance after optimization')
  .action(async (input, options) => {
    validateSVG(input);

    let outputPath;
    if (options.output) {
      if (fs.existsSync(options.output) && fs.statSync(options.output).isDirectory()) {
        outputPath = generateOutputPath(input, options.output);
      } else {
        outputPath = options.output;
      }
    } else {
      outputPath = generateOutputPath(input);
    }

    await optimizeSVG(input, outputPath, {
      preserveViewBox: options.preserveViewbox,
      validate: options.validate
    });
  });

if (require.main === module) {
  program.parse();
}

module.exports = { optimizeSVG, appleCompliantConfig };
