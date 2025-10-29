import { build } from 'esbuild';

const entryPoints = ['src/handlers/health-ping.ts'];

async function runBuild() {
  await build({
    entryPoints,
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    sourcemap: true,
    minify: false,
    keepNames: true,
    external: ['@aws-sdk/*'],
    banner: {
      js: "'use strict';",
    },
  });
  console.log(JSON.stringify({ level: 'info', msg: 'Lambda handlers bundled', entryPoints }));
}

runBuild().catch((error) => {
  console.error(JSON.stringify({ level: 'error', msg: 'Build failed', error }));
  process.exitCode = 1;
});
