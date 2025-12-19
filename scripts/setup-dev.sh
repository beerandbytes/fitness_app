#!/bin/bash
# Script de configuración inicial para desarrollo
# Instala todas las dependencias y configura el entorno

set -e

echo "🚀 Configurando entorno de desarrollo para Fitness App..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${BLUE}📦 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js no está instalado. Por favor instala Node.js >= 22.0.0${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${YELLOW}⚠️  Node.js versión $NODE_VERSION detectada. Se recomienda Node.js >= 22.0.0${NC}"
else
    echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"
fi

# Verificar npm
echo -e "${BLUE}📦 Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v) detectado${NC}"

# Instalar dependencias raíz
echo ""
echo -e "${BLUE}📦 Instalando dependencias raíz...${NC}"
npm install

# Instalar dependencias backend
echo ""
echo -e "${BLUE}🔧 Instalando dependencias backend...${NC}"
cd fitness-app-backend
npm install
cd ..

# Instalar dependencias frontend
echo ""
echo -e "${BLUE}⚛️  Instalando dependencias frontend...${NC}"
cd fitness-app-frontend
npm install
cd ..

# Instalar dependencias documentación
echo ""
echo -e "${BLUE}📚 Instalando dependencias documentación...${NC}"
cd docs
npm install
cd ..

# Verificar archivos .env
echo ""
echo -e "${BLUE}🔍 Verificando archivos .env...${NC}"

if [ ! -f "fitness-app-backend/.env" ]; then
    echo -e "${YELLOW}⚠️  fitness-app-backend/.env no existe${NC}"
    if [ -f "fitness-app-backend/.env.example" ]; then
        echo -e "${BLUE}📋 Copiando .env.example a .env...${NC}"
        cp fitness-app-backend/.env.example fitness-app-backend/.env
        echo -e "${YELLOW}⚠️  Por favor edita fitness-app-backend/.env con tus valores${NC}"
    fi
else
    echo -e "${GREEN}✅ fitness-app-backend/.env existe${NC}"
fi

if [ ! -f "fitness-app-frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  fitness-app-frontend/.env no existe${NC}"
    if [ -f "fitness-app-frontend/.env.example" ]; then
        echo -e "${BLUE}📋 Copiando .env.example a .env...${NC}"
        cp fitness-app-frontend/.env.example fitness-app-frontend/.env
        echo -e "${YELLOW}⚠️  Por favor edita fitness-app-frontend/.env con tus valores${NC}"
    fi
else
    echo -e "${GREEN}✅ fitness-app-frontend/.env existe${NC}"
fi

# Resumen final
echo ""
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo -e "1. Edita los archivos .env con tus valores de configuración"
echo -e "2. Configura tu base de datos PostgreSQL"
echo -e "3. Ejecuta migraciones: ${YELLOW}npm run backend:migrate${NC}"
echo -e "4. Inicia el backend: ${YELLOW}npm run backend:start${NC}"
echo -e "5. En otra terminal, inicia el frontend: ${YELLOW}npm run frontend:dev${NC}"
echo ""
echo -e "${BLUE}💡 O usa Docker:${NC}"
echo -e "   ${YELLOW}docker-compose up${NC}"
echo ""

