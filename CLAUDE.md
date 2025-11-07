# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mapa do Bosque** is a KPI dashboard system for Grupo JCC shopping centers. The system consists of:
- Django REST API backend for authentication and data analytics
- React + TypeScript frontend with ECharts visualizations
- PostgreSQL database (Supabase in production)
- Redis cache for WBR Analytics performance

**Developed by:** Grupo JCC Digitalização team

## Architecture

### Monorepo Structure

```
mapa-do-bosque-2/
├── backend/           # Django REST API
│   ├── api/          # User authentication app (Token-based auth, password reset)
│   ├── wbr/          # WBR Analytics module (modular chart data generation)
│   └── mapaconfig/   # Django settings
└── frontend/         # React + Vite + TypeScript
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── hooks/
```

### Backend Architecture (Django)

The backend has two main Django apps:

**1. `api` app - Authentication System**
- Token-based authentication using Django REST Framework
- Custom User model extending AbstractUser with `cargo` (position) and `setor` (department) fields
- Corporate email domain validation (jccbr.com, iguatemifortaleza.com.br, northshoppingjoquei.com.br, northshoppingmaracanau.com.br)
- Password reset with 6-digit codes (15-minute expiration)
- Endpoints: `/api/cadastro/`, `/api/login/`, `/api/logout/`, `/api/request-password-reset/`, `/api/password-reset/`

**2. `wbr` app - Analytics Module (Working Backwards Requirements)**

A highly modular system for generating chart data without writing code for each chart:

**Key Architecture Principle:** Configuration over code - add new charts by creating JSON config files only.

**Components (SOLID principles):**
- `ConfigLoader`: Loads JSON configurations from `wbr/config/graficos/` and `wbr/config/pages/`
- `QueryBuilder`: Dynamically builds SQL queries from config (single reusable template in `wbr/sql/query_template.sql`)
- `DatabaseInterface`: Abstract interface with PostgreSQL implementation (connection pooling)
- `DataProcessor`: Transforms raw data into WBR format (weekly/monthly aggregations with CY/PY comparisons)
- `CacheInterface`: Pluggable cache system (Redis or NullCache)
- `WBRService`: Main orchestrator coordinating all components
- `ComponentFactory`: Creates and wires dependencies

**WBR Data Format:**
```json
{
  "semanas_cy": {"metric_value": {...}, "index": [...]},
  "semanas_py": {"metric_value": {...}, "index": [...]},
  "meses_cy": {...},
  "meses_py": {...},
  "ano_atual": 2025,
  "ano_anterior": 2024,
  "semana_parcial": false,
  "mes_parcial_cy": true
}
```

**Adding New Charts:**
1. Create `wbr/config/graficos/{chart_id}.json` with table name, columns, filters, and aggregation type
2. Optionally add to `wbr/config/pages/{page_id}.json` for dashboard grouping
3. No code changes needed - system auto-generates endpoints

**API Endpoints:**
- Single chart: `GET /api/wbr/{grafico_id}/`
- Full page (parallel queries, recommended): `GET /api/wbr/page/{page_id}/`

**Specialized Query Builders:**
- `InstagramQueryBuilder`: For Instagram metrics
- `RgmCtoPercentualQueryBuilder`: For RGM/CTO percentage calculations

### Frontend Architecture (React)

**Tech Stack:**
- React 19 + TypeScript
- Vite (dev server + build tool)
- ECharts for data visualizations
- Material-UI components
- TailwindCSS + Emotion for styling
- React Router for navigation

**Key Services:**
- `wbrApi.ts`: API client for WBR endpoints
- `useWBRPage` hook: Fetches dashboard data with loading/error states

**Chart Components:**
- `WBRChart.tsx`: Main chart wrapper that interfaces with ECharts
- Filter components in `components/features/filters/`: DateFilter, LojaFilter, CategoriaFilter, RamoFilter

## Development Commands

### Backend (Django)

```bash
cd backend

# Setup virtual environment and install dependencies
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install with pip
pip install -r requirements.txt

# Or with uv (faster)
pip install uv
uv pip install -r requirements.txt

# Run migrations
python manage.py migrate
# Or: uv run python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run development server
python manage.py runserver
# Or: uv run python manage.py runserver

# Collect static files (production)
python manage.py collectstatic --no-input

# Django shell
python manage.py shell
```

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Run development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# TypeScript check
tsc -b
```

### Testing Unified Deployment Locally

To test how the app will work in production (single port):

```bash
# 1. Build frontend
cd frontend
npm run build  # Creates dist/ folder

# 2. Run Django (serves both frontend and API)
cd ../backend
python manage.py collectstatic --no-input
python manage.py runserver

# Access at http://localhost:8000
# - /         → React app
# - /api/     → Django API
# - /admin/   → Django Admin
```

### Docker Compose (Full Stack)

```bash
# Start all services (from root directory)
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## Environment Variables

### Backend (.env in backend/.secrets/)

```bash
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (development uses SQLite, production uses PostgreSQL/Supabase)
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis (optional, for WBR cache)
WBR_CACHE_ENABLED=False
WBR_REDIS_URL=redis://localhost:6379/0
WBR_CACHE_TTL=3600
WBR_DB_POOL_SIZE=20
WBR_QUERY_TIMEOUT=30
WBR_LOG_LEVEL=INFO
WBR_LOG_FORMAT=json

# Email (for password reset)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@mapadobosque.com
```

### Frontend (.env in frontend/)

```bash
VITE_API_URL=http://localhost:8000/api
```

## Database Management

### Migrations

```bash
# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations status
python manage.py showmigrations
```

### Django Admin

Access at `http://localhost:8000/admin/`
- Manage users, tokens, password reset codes
- View WBR configurations

## Deployment

### Unified Deployment (Single Port)

The project uses a **unified deployment architecture** where Frontend and Backend run on the **same port and domain**:

```
┌─────────────────────────────────────┐
│   https://mapa-do-bosque.onrender  │
│                                     │
│  Django serves:                     │
│  - /          → React index.html   │
│  - /login     → React index.html   │
│  - /dashboard → React index.html   │
│  - /api/*     → Django REST API    │
│  - /admin/    → Django Admin       │
│  - /assets/*  → Static files       │
└─────────────────────────────────────┘
```

**Benefits:**
- Single Render Web Service (cost-effective)
- No CORS needed (same-origin)
- Simplified deployment
- Automatic SSL for everything

**How it works:**
1. `npm run build` creates `frontend/dist/` with React production build
2. Django's `collectstatic` copies assets from `frontend/dist/assets/` to `staticfiles/`
3. Django serves `index.html` for all non-API routes (catch-all view)
4. React Router handles client-side routing
5. API requests go to `/api/*` (relative path)

**Key files:**
- `backend/mapaconfig/views.py`: `ReactAppView` - catch-all view that serves index.html
- `backend/mapaconfig/urls.py`: URL routing with catch-all as last route
- `backend/mapaconfig/settings.py`: `STATICFILES_DIRS` includes `frontend/dist/assets/`
- `frontend/.env.production`: `VITE_API_URL=/api` (relative path)
- `render.yaml`: Single Web Service blueprint

**Deployment commands (in render.yaml):**
```bash
# Install Node.js and build frontend
npm install && npm run build  # Creates frontend/dist/

# Install backend dependencies
pip install uv && uv sync

# Collect static files (includes React build)
uv run python manage.py collectstatic --no-input

# Run migrations
uv run python manage.py migrate --no-input

# Start server
uv run gunicorn mapaconfig.wsgi:application --workers 4 --bind 0.0.0.0:$PORT
```

See `DEPLOY_UNIFICADO.md` for detailed unified deployment guide and `SUPABASE_CONFIG.md` for database setup.

## Important Patterns

### Adding a New WBR Chart

1. **Create chart config:** `backend/wbr/config/graficos/my_chart.json`
```json
{
  "grafico_id": "my_chart",
  "tabela": "fato_vendas",
  "colunas": {
    "data": "data_venda",
    "valor": "total_vendas"
  },
  "filtros": {
    "regiao": "Nordeste"
  },
  "agrupamento": "semanal"
}
```

2. **Test endpoint:** `curl http://localhost:8000/api/wbr/my_chart/`

3. **Optional - Add to dashboard:** Edit `backend/wbr/config/pages/dashboard_name.json` to include chart ID

4. **Frontend integration:** Use `useWBRPage('dashboard_name')` hook

### WBR Query Builders

When creating specialized query builders (like Instagram or RGM/CTO), extend the base `QueryBuilder` class and implement custom SQL generation logic. Place SQL templates in `backend/wbr/sql/{module_name}/query_template.sql`.

### Authentication Flow

1. User registers via `/api/cadastro/` with corporate email
2. Backend validates email domain and generates username from first/last name
3. User logs in via `/api/login/` and receives token
4. Frontend stores token and includes in all requests: `Authorization: Token <token>`
5. Token is invalidated on logout via `/api/logout/`

### CORS Configuration

The backend allows:
- Local development (localhost:5173)
- Ngrok tunnels (*.ngrok-free.app, *.ngrok.io, *.ngrok.app)
- Cloudflare tunnels (*.trycloudflare.com)
- Render (*.onrender.com)

Configured in `backend/mapaconfig/settings.py` via `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`.

## Code Quality

- Backend follows SOLID principles especially in WBR module
- Dependency injection used throughout WBR (ConfigLoader, QueryBuilder, DatabaseInterface, CacheInterface)
- SQL injection protection via parameterized queries and identifier sanitization
- Frontend uses TypeScript strict mode
- React components follow functional patterns with hooks

## Security Notes

- **Email validation:** Only corporate domains allowed (jccbr.com, iguatemifortaleza.com.br, northshoppingjoquei.com.br, northshoppingmaracanau.com.br)
- **Password requirements:** Minimum 8 characters
- **Password reset:** 6-digit codes valid for 15 minutes, single-use
- **SQL security:** Prepared statements, identifier sanitization, query timeout (30s)
- **Production settings:** DEBUG=False, specific ALLOWED_HOSTS, CORS restricted to known domains

## Key Files to Reference

- **Backend settings:** `backend/mapaconfig/settings.py`
- **WBR architecture:** `backend/wbr/README.md`
- **API endpoints:** `backend/api/urls.py`, `backend/wbr/urls.py`
- **Main URL config:** `backend/mapaconfig/urls.py`
- **User model:** `backend/api/models.py`
- **WBR orchestrator:** `backend/wbr/services/wbr_service.py`
- **Frontend API client:** `frontend/src/services/wbrApi.ts`
- **Deployment guide:** `DEPLOY_RENDER.md`
- **Supabase setup:** `SUPABASE_CONFIG.md`
