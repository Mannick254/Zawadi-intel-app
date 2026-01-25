import { execSync } from 'child_process';

const run = (command) => {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit' });
};

console.log('Cleaning dist folder...');
run('rm -rf dist');

console.log('Building project...');
run('vite build');

console.log('Build finished.');
