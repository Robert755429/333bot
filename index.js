import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile, existsSync } from 'fs';
import yargs from 'yargs';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);

// Se siamo su Render, salta tutte le animazioni
const isRender = process.env.RENDER || process.env.PHONE_NUMBER;

const checkAndInstallModules = () => {
  const nodeModulesPath = join(__dirname, 'node_modules');
  if (!existsSync(nodeModulesPath)) {
    console.log('Installazione moduli...');
    execSync('npm install', { stdio: 'inherit' });
  }
};
checkAndInstallModules();

async function start(file) {
  if (!isRender) {
    // animazione solo in locale
    console.log('\n=== 333 BOT V10.3 ===\nAvvio...\n');
  } else {
    console.log(`\n[RENDER] Avvio 333 Bot per numero: 393887347002\n`);
  }

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  setupMaster({ exec: args[0], args: args.slice(1) });
  let p = fork();

  p.on('message', (data) => {
    console.log('[→]', data);
    if (data === 'reset') {
      p.kill();
      start(file);
    }
  });

  p.on('exit', (_, code) => {
    console.error(`\n✖ Processo morto con code ${code}, riavvio...\n`);
    if (code !== 0) {
      setTimeout(() => start(file), 3000);
    }
  });
}

start('333.js');
