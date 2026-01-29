const { build } = require('vite');
const path = require('path');

async function buildBlocks() {
  try {
    console.log('Starting build...');
    
    const result = await build({
      configFile: 'vite.blocks.config.js',
      logLevel: 'info',
    });
    
    console.log('Build completed!');
    console.log('Output directory:', path.resolve('build'));
  } catch (error) {
    console.error('Build failed:');
    console.error(error);
    process.exit(1);
  }
}

buildBlocks();
