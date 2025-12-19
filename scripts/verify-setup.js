#!/usr/bin/env node
/**
 * Script de verificación de configuración del proyecto
 * Verifica que todas las dependencias, configuraciones y archivos necesarios estén presentes
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - NO ENCONTRADO`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - NO ENCONTRADO`, 'red');
    return false;
  }
}

function checkPackageJson(dirPath, description) {
  const packagePath = path.join(process.cwd(), dirPath, 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      log(`✅ ${description} (v${pkg.version || 'N/A'})`, 'green');
      return true;
    } catch (error) {
      log(`⚠️  ${description} - Error al leer package.json`, 'yellow');
      return false;
    }
  } else {
    log(`❌ ${description} - package.json no encontrado`, 'red');
    return false;
  }
}

function main() {
  log('\n🔍 Verificando configuración del proyecto Fitness App\n', 'blue');
  log('='.repeat(60), 'blue');

  let allGood = true;

  // Archivos de configuración raíz
  log('\n📋 Archivos de Configuración Raíz:', 'blue');
  allGood &= checkFile('.gitignore', '.gitignore');
  allGood &= checkFile('.prettierrc', '.prettierrc');
  allGood &= checkFile('.prettierignore', '.prettierignore');
  allGood &= checkFile('package.json', 'package.json (raíz)');
  allGood &= checkFile('LICENSE.md', 'LICENSE.md');
  allGood &= checkFile('README.md', 'README.md');
  allGood &= checkFile('CHANGELOG.md', 'CHANGELOG.md');
  allGood &= checkFile('CONTRIBUTING.md', 'CONTRIBUTING.md');

  // Docker
  log('\n🐳 Archivos Docker:', 'blue');
  allGood &= checkFile('docker-compose.yml', 'docker-compose.yml');
  allGood &= checkFile('docker-compose.prod.yml', 'docker-compose.prod.yml');

  // Backend
  log('\n🔧 Backend:', 'blue');
  allGood &= checkDirectory('fitness-app-backend', 'Directorio fitness-app-backend');
  allGood &= checkPackageJson('fitness-app-backend', 'Backend package.json');
  allGood &= checkFile('fitness-app-backend/.env.example', 'Backend .env.example');
  allGood &= checkFile('fitness-app-backend/Dockerfile', 'Backend Dockerfile');
  allGood &= checkFile('fitness-app-backend/index.js', 'Backend index.js');
  allGood &= checkFile('fitness-app-backend/db/schema.js', 'Backend schema.js');

  // Frontend
  log('\n⚛️  Frontend:', 'blue');
  allGood &= checkDirectory('fitness-app-frontend', 'Directorio fitness-app-frontend');
  allGood &= checkPackageJson('fitness-app-frontend', 'Frontend package.json');
  allGood &= checkFile('fitness-app-frontend/.env.example', 'Frontend .env.example');
  allGood &= checkFile('fitness-app-frontend/Dockerfile', 'Frontend Dockerfile');
  allGood &= checkFile('fitness-app-frontend/src/App.jsx', 'Frontend App.jsx');
  allGood &= checkFile('fitness-app-frontend/vite.config.js', 'Frontend vite.config.js');

  // Documentación
  log('\n📚 Documentación:', 'blue');
  allGood &= checkDirectory('docs', 'Directorio docs');
  allGood &= checkPackageJson('docs', 'Docs package.json');
  allGood &= checkFile('docs/docusaurus.config.js', 'Docusaurus config');
  allGood &= checkFile('docs/sidebars.js', 'Sidebars config');

  // Verificar node_modules (opcional)
  log('\n📦 Dependencias (opcional):', 'blue');
  const backendNodeModules = path.join(process.cwd(), 'fitness-app-backend', 'node_modules');
  const frontendNodeModules = path.join(process.cwd(), 'fitness-app-frontend', 'node_modules');
  const docsNodeModules = path.join(process.cwd(), 'docs', 'node_modules');

  if (fs.existsSync(backendNodeModules)) {
    log('✅ Backend node_modules instalado', 'green');
  } else {
    log('⚠️  Backend node_modules no instalado (ejecuta: npm run backend:install)', 'yellow');
  }

  if (fs.existsSync(frontendNodeModules)) {
    log('✅ Frontend node_modules instalado', 'green');
  } else {
    log('⚠️  Frontend node_modules no instalado (ejecuta: npm run frontend:install)', 'yellow');
  }

  if (fs.existsSync(docsNodeModules)) {
    log('✅ Docs node_modules instalado', 'green');
  } else {
    log('⚠️  Docs node_modules no instalado (ejecuta: cd docs && npm install)', 'yellow');
  }

  // Resumen final
  log('\n' + '='.repeat(60), 'blue');
  if (allGood) {
    log('\n✅ ¡Todo está configurado correctamente!', 'green');
    log('🚀 El proyecto está listo para desarrollo.\n', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Se encontraron algunos problemas.', 'yellow');
    log('📝 Revisa los errores arriba y corrige los archivos faltantes.\n', 'yellow');
    process.exit(1);
  }
}

main();

