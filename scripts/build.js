import esbuild from 'esbuild';
import { mkdirSync } from 'fs';

const sharedConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'neutral',
  target: ['es2020'],
  external: ['@koush/wrtc', 'pigeonns'], // Keep as external since they're peer/optional dependencies
};

async function build() {
  try {
    // Create dist directory
    mkdirSync('dist', { recursive: true });

    // Build ESM for Node.js
    await esbuild.build({
      ...sharedConfig,
      format: 'esm',
      outfile: 'dist/index.mjs',
      sourcemap: true,
    });
    console.log('✓ Built ESM module (dist/index.mjs)');

    // Build CommonJS for Node.js
    await esbuild.build({
      ...sharedConfig,
      format: 'cjs',
      outfile: 'dist/index.js',
      sourcemap: true,
    });
    console.log('✓ Built CommonJS module (dist/index.js)');

    // Build browser bundle (no Node.js dependencies)
    await esbuild.build({
      ...sharedConfig,
      format: 'iife',
      globalName: 'PigeonRTC',
      outfile: 'dist/browser.js',
      platform: 'browser',
      sourcemap: true,
      // For browser builds, we only want browser adapter
      banner: {
        js: '/* PigeonRTC Browser Bundle */',
      },
    });
    console.log('✓ Built browser bundle (dist/browser.js)');

    // Build minified browser bundle
    await esbuild.build({
      ...sharedConfig,
      format: 'iife',
      globalName: 'PigeonRTC',
      outfile: 'dist/browser.min.js',
      platform: 'browser',
      minify: true,
      sourcemap: true,
    });
    console.log('✓ Built minified browser bundle (dist/browser.min.js)');

    console.log('\n✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
