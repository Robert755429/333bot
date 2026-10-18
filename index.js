import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile, existsSync } from 'fs';
import yargs from 'yargs';
import { execSync } from 'child_process';

process.env.SUPPRESS_BANNER = 'true';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);

// Rilevamento automatico ambiente Render per evitare crash con le animazioni
const isRender = process.env.RENDER || process.env.PHONE_NUMBER || process.env.CI;

const checkAndInstallModules = () => {
  const nodeModulesPath = join(__dirname, 'node_modules');
  
  if (!existsSync(nodeModulesPath)) {
    console.log('\n[333] Installazione moduli in corso...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('\n✓ Moduli installati con successo!');
    } catch (error) {
      console.error('\n✖ Errore durante l\'installazione dei moduli');
      process.exit(1);
    }
  }
};

checkAndInstallModules();

let cfonts;
try {
  cfonts = (await import('cfonts')).default;
} catch (e) {
  if (!isRender) {
    console.error('Errore caricamento cfonts, reinstallazione...');
    execSync('npm install', { stdio: 'inherit' });
    cfonts = (await import('cfonts')).default;
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const typeWriterBig = async (text, delay = 100) => {
  if (isRender) return;
  let current = '';
  for (let char of text) {
    current += char;
    console.clear();
    console.log('\n\n');
    cfonts.say(current, {
      font: 'block',
      align: 'center',
      gradient: ['red', 'magenta', 'cyan'],
      transitionGradient: true,
    });
    await sleep(delay);
  }
};

const loading = async (text, duration = 1000) => {
  if (isRender) {
    await sleep(200);
    console.log(`[333] ${text}... OK`);
    return;
  }
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const startTime = Date.now();
  let i = 0;
  
  return new Promise(resolve => {
    const interval = setInterval(() => {
      process.stdout.write(`\r\x1b[35m${frames[i]} \x1b[36m${text}\x1b[0m`);
      i = (i + 1) % frames.length;
      
      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
        process.stdout.write(`\r\x1b[32m✓ \x1b[36m${text}\x1b[0m\n`);
        resolve();
      }
    }, 60);
  });
};

const progressBar = async (label, duration = 1200) => {
  if (isRender) return;
  const barLength = 40;
  const steps = 50;
  const stepDuration = duration / steps;
  
  for (let i = 0; i <= steps; i++) {
    const filled = Math.floor((i / steps) * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.floor((i / steps) * 100);
    process.stdout.write(`\r\x1b[36m${label} \x1b[35m[${bar}] \x1b[33m${percent}%\x1b[0m`);
    await sleep(stepDuration);
  }
  console.log();
};

const pulse = async (text, times = 3) => {
  if (isRender) return;
  const colors = ['\x1b[31m', '\x1b[33m', '\x1b[35m', '\x1b[36m'];
  for (let i = 0; i < times; i++) {
    for (let color of colors) {
      process.stdout.write(`\r${color}${text}\x1b[0m`);
      await sleep(60);
    }
  }
  console.log();
};

const typeWriter = async (text, delay = 25, color = '\x1b[36m') => {
  if (isRender) {
    console.log(text.trim());
    return;
  }
  const reset = '\x1b[0m';
  for (let char of text) {
    process.stdout.write(color + char + reset);
    await sleep(delay);
  }
  console.log();
};

async function epicStartup() {
  if (isRender) {
    console.log('\n========================================');
    console.log('   [RENDER] 333 BOT V10.3 - AVVIATO');
    console.log('   Numero collegato: 393887347002');
    console.log('========================================\n');
    return;
  }

  console.clear();
  await sleep(300);
  await typeWriterBig('333\nBOT V10.3\n2026', 120);
  await sleep(400);
  
  console.log('\n');
  await typeWriter('                           Ultimo Aggiornamento: 13/09/2026', 40, '\x1b[33m');
  
  console.log('\n');
  await typeWriter('                          Edit by Gab, Lucifero & 333 Staff', 35, '\x1b[36m');
  
  console.log('\n\n');
  console.log('\x1b[90m' + '━'.repeat(70) + '\x1b[0m');
  console.log('\n');
  
  await progressBar('Caricamento sistema', 1100);
  await loading('Inizializzazione moduli', 600);
  await loading('Connessione database', 550);
  await loading('Attivazione protocolli', 600);
  await loading('Sincronizzazione', 500);
  await progressBar('Finalizzazione', 900);
  
  console.log('\n');
  console.log('\x1b[90m' + '━'.repeat(70) + '\x1b[0m');
  console.log('\n');
  
  await sleep(200);
  await pulse('                     #333NEVERDIES', 4);
  
  console.log('\n');
  console.log('\x1b[90m' + '━'.repeat(70) + '\x1b[0m');
  console.log('\n\n');
}

let isRunning = false;

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  await epicStartup();

  const args = [join(__dirname, file), ...process.argv.slice(2)];

  if (!isRender) {
    console.log('\x1b[32m✓ Sistema pronto\x1b[0m');
    console.log('\x1b[32m✓ Bot online\x1b[0m');
    console.log('\x1b[32m✓ Tutti i sistemi operativi\x1b[0m\n');
  } else {
    console.log('[333] Cluster avviato correttamente. In attesa del pairing code...');
  }

  setupMaster({
    exec: args[0],
    args: args.slice(1),
  });

  let processInstance = fork();

  processInstance.on('message', (data) => {
    console.log('\x1b[36m[→]\x1b[0m', data);
    switch (data) {
      case 'reset':
        console.log('\x1b[33m\n⟳ Riavvio in corso...\x1b[0m\n');
        processInstance.kill();
        isRunning = false;
        start(file);
        break;
      case 'uptime':
        processInstance.send(process.uptime());
        break;
    }
  });

  processInstance.on('exit', (_, code) => {
    isRunning = false;
    console.error('\n\x1b[31m✖ Errore processo [' + code + ']\x1b[0m\n');

    if (code !== 0) {
      setTimeout(() => {
        console.log('\x1b[32m↻ Recupero automatico...\x1b[0m\n');
        start(file);
      }, 3000);
    }
  });
}

start('333.js');
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
