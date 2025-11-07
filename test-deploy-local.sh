#!/bin/bash
# Script para testar o deploy unificado localmente

set -e  # Para no primeiro erro

echo "========================================="
echo "  Testando Deploy Unificado Localmente"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se uv está instalado
if ! command -v uv &> /dev/null; then
    echo -e "${RED}✗ uv não encontrado. Instale com: pip install uv${NC}"
    exit 1
fi

# 1. Build do Frontend
echo -e "${BLUE}[1/4] Building Frontend...${NC}"
cd frontend
npm install
npm run build
echo -e "${GREEN}✓ Frontend build completo (frontend/dist/)${NC}"
echo ""

# 2. Setup Backend Dependencies
echo -e "${BLUE}[2/4] Installing backend dependencies...${NC}"
cd ../backend
uv sync
echo -e "${GREEN}✓ Dependências instaladas${NC}"
echo ""

# 3. Collect Static Files
echo -e "${BLUE}[3/4] Collecting static files...${NC}"
uv run python manage.py collectstatic --no-input
echo -e "${GREEN}✓ Static files coletados (backend/staticfiles/)${NC}"
echo ""

# 4. Run Migrations
echo -e "${BLUE}[4/4] Running migrations...${NC}"
uv run python manage.py migrate --no-input
echo -e "${GREEN}✓ Migrations aplicadas${NC}"
echo ""

# Instruções finais
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}  ✓ Setup Completo!${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""
echo "Agora execute:"
echo ""
echo -e "  ${BLUE}cd backend${NC}"
echo -e "  ${BLUE}uv run python manage.py runserver${NC}"
echo ""
echo "Depois acesse:"
echo -e "  ${GREEN}→ Frontend:${NC} http://localhost:8000"
echo -e "  ${GREEN}→ API:${NC}      http://localhost:8000/api/"
echo -e "  ${GREEN}→ Admin:${NC}    http://localhost:8000/admin/"
echo ""
echo -e "${GREEN}✓ Deploy unificado pronto para teste!${NC}"
