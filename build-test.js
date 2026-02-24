import { build } from 'vite';

async function testBuild() {
  try {
    console.log('Starting programmatic build...');
    await build({
      build: {
        minify: false,
        rollupOptions: {
          onwarn(warning, warn) {
             console.log("WARN:", warning.message);
          }
        }
      },
      logLevel: 'info',
    });
    console.log('Build completed successfully.');
  } catch (err) {
    console.error('--- BUILD FAILED WITH ERROR ---');
    console.error(err);
    process.exit(1);
  }
}

testBuild();
