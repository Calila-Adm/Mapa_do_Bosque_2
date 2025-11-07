# 🚀 Guia de Deploy no Render - Mapa do Bosque

Este guia completo mostra como fazer o deploy do monorepo Mapa do Bosque no Render.

## 📋 Pré-requisitos

1. **Conta no Render**: [render.com](https://render.com) (pode usar conta gratuita)
2. **Repositório no GitHub**: Seu código precisa estar em um repositório Git
3. **UV instalado localmente** (para testes): [docs.astral.sh/uv](https://docs.astral.sh/uv/)

---

## 🏗️ Arquitetura do Deploy

```
┌─────────────────────────────────────────────────┐
│               RENDER PLATFORM                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐      ┌────────────────┐      │
│  │   Frontend   │      │    Backend     │      │
│  │ Static Site  │─────▶│  Web Service   │      │
│  │  (React)     │ API  │   (Django)     │      │
│  └──────────────┘      └────────┬───────┘      │
│                                  │               │
│                         ┌────────┴────────┐     │
│                         │                 │     │
│                    ┌────▼─────┐    ┌─────▼───┐ │
│                    │PostgreSQL│    │  Redis  │ │
│                    │ Database │    │  Cache  │ │
│                    └──────────┘    └─────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 📝 Passo 1: Preparar o Repositório

### 1.1 Commit e Push das mudanças

```bash
# Na raiz do projeto
git add .
git commit -m "Configuração para deploy no Render"
git push origin main
```

### 1.2 Verificar arquivos importantes

Certifique-se de que estes arquivos existem:

- ✅ `/render.yaml` - Configuração principal do Render
- ✅ `/backend/pyproject.toml` - Dependências Python (com gunicorn e whitenoise)
- ✅ `/backend/mapaconfig/settings.py` - Configurações Django atualizadas
- ✅ `/frontend/package.json` - Dependências Node.js

---

## 🎯 Passo 2: Deploy Automático via Blueprint

### 2.1 Acessar o Render Dashboard

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Faça login com sua conta
3. Clique em **"New +"** → **"Blueprint"**

### 2.2 Conectar Repositório

1. Selecione **"GitHub"** (ou GitLab/Bitbucket)
2. Autorize o Render a acessar seus repositórios
3. Selecione o repositório **`mapa-do-bosque-2`**
4. O Render detectará automaticamente o arquivo `render.yaml`

### 2.3 Revisar Serviços

O Render mostrará:
- ✅ **mapa-backend** (Web Service - Python)
- ✅ **mapa-frontend** (Static Site)
- ✅ **mapa-database** (PostgreSQL)
- ✅ **mapa-redis** (Redis)

### 2.4 Configurar Variáveis de Email (IMPORTANTE)

Antes de aplicar o blueprint, você precisa configurar as variáveis de email:

1. No dashboard, clique em **"Environment"**
2. Adicione manualmente:
   - `EMAIL_HOST_USER`: seu-email@outlook.com (ou Gmail)
   - `EMAIL_HOST_PASSWORD`: sua-senha-de-app

> **📧 Como obter senha de app:**
> - **Outlook**: [account.microsoft.com/security](https://account.microsoft.com/security) → App passwords
> - **Gmail**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### 2.5 Aplicar Blueprint

1. Clique em **"Apply"**
2. Aguarde o Render criar todos os serviços (5-10 minutos)
3. Acompanhe os logs de build em tempo real

---

## 🔍 Passo 3: Verificar Deploy

### 3.1 Backend (API)

1. Acesse o serviço **`mapa-backend`** no dashboard
2. Copie a URL (ex: `https://mapa-backend.onrender.com`)
3. Teste no navegador: `https://mapa-backend.onrender.com/api/`
4. Deve retornar resposta JSON

**Exemplo de teste com cURL:**
```bash
curl https://mapa-backend.onrender.com/api/
```

### 3.2 Frontend (React)

1. Acesse o serviço **`mapa-frontend`** no dashboard
2. Copie a URL (ex: `https://mapa-frontend.onrender.com`)
3. Abra no navegador - deve carregar a landing page do Mapa do Bosque

### 3.3 Verificar Logs

Se algo der errado:
```
Dashboard → mapa-backend → Logs
Dashboard → mapa-frontend → Logs
```

---

## ⚙️ Passo 4: Configurações Pós-Deploy

### 4.1 Atualizar URL do Frontend

Se o Render alterou os nomes dos serviços, atualize a variável de ambiente:

1. Dashboard → **mapa-frontend** → **Environment**
2. Edite `VITE_API_URL`
3. Valor correto: `https://SEU-BACKEND.onrender.com/api`
4. Salve e aguarde redeploy automático

### 4.2 Criar Superusuário (Admin Django)

Para acessar o Django Admin:

```bash
# No dashboard do backend, abra o Shell
cd backend
uv run python manage.py createsuperuser

# Preencha:
# - Username: admin
# - Email: seu-email@jccbr.com
# - Password: senha-forte
```

### 4.3 Acessar Django Admin

```
https://SEU-BACKEND.onrender.com/admin/
```

---

## 🔐 Passo 5: Segurança e Configurações Adicionais

### 5.1 Variáveis de Ambiente Sensíveis

**Nunca commite no Git:**
- ❌ SECRET_KEY
- ❌ EMAIL_HOST_PASSWORD
- ❌ DATABASE_URL

✅ O Render gera automaticamente via `render.yaml`

### 5.2 CORS em Produção

O `settings.py` está configurado para permitir:
- `https://*.onrender.com`
- Seus domínios customizados (se adicionar)

Para adicionar domínio customizado:
```python
# settings.py
CSRF_TRUSTED_ORIGINS = [
    'https://mapadobosque.com.br',
    'https://*.onrender.com',
]
```

### 5.3 Debug Mode

**IMPORTANTE:** `DEBUG = False` em produção (já configurado)

Para verificar:
```
Dashboard → mapa-backend → Environment → DEBUG = False
```

---

## 📊 Passo 6: Monitoramento

### 6.1 Health Checks

O Render monitora automaticamente:
- Backend: `GET /api/` a cada 5 minutos
- Se falhar 3x consecutivas → reinicia o serviço

### 6.2 Logs em Tempo Real

```
Dashboard → Service → Logs → Enable Auto-scroll
```

### 6.3 Métricas

```
Dashboard → Service → Metrics
```
- CPU Usage
- Memory Usage
- Request Count
- Response Time

---

## 💰 Custos (Plano Free)

| Serviço | Plano | Custo | Recursos |
|---------|-------|-------|----------|
| Backend | Starter | **$0/mês** (Free tier 750h) | 512MB RAM, Sleep após 15min inatividade |
| Frontend | Starter | **$0/mês** | 100GB bandwidth |
| PostgreSQL | Starter | **$0/mês** (90 dias) | 1GB storage |
| Redis | Starter | **$0/mês** (90 dias) | 25MB |

**Total Free Tier:** $0/mês (primeiros 90 dias)

**Após 90 dias:**
- PostgreSQL: $7/mês
- Redis: $10/mês
- Backend/Frontend: Continua grátis

---

## 🔄 Atualizações e Redeploy

### Atualização Automática

Toda vez que você fizer `git push` para `main`:
```bash
git add .
git commit -m "Nova feature"
git push origin main
```

O Render **automaticamente**:
1. ✅ Detecta mudanças
2. ✅ Rebuild dos serviços
3. ✅ Deploy automático
4. ✅ Rollback se falhar

### Redeploy Manual

Se precisar forçar redeploy:
```
Dashboard → Service → Manual Deploy → Deploy Latest Commit
```

### Rollback

Se algo der errado:
```
Dashboard → Service → Events → Restore Previous Deploy
```

---

## 🐛 Troubleshooting

### ❌ Erro: "Application failed to respond"

**Causa:** Backend não está respondendo na porta correta

**Solução:**
```bash
# Verifique o comando de start no render.yaml:
startCommand: uv run gunicorn mapaconfig.wsgi:application --bind 0.0.0.0:$PORT
```

### ❌ Erro: "CORS policy"

**Causa:** Frontend não está na lista de origens permitidas

**Solução:**
```python
# backend/mapaconfig/settings.py
CSRF_TRUSTED_ORIGINS = [
    'https://mapa-frontend.onrender.com',
    'https://*.onrender.com',
]
```

Redeploy o backend após mudança.

### ❌ Erro: "Database connection failed"

**Causa:** DATABASE_URL não configurada

**Solução:**
```
Dashboard → mapa-backend → Environment → DATABASE_URL
```
Deve apontar para `mapa-database` (automático via render.yaml)

### ❌ Erro: "Module not found"

**Causa:** Dependência faltando no `pyproject.toml`

**Solução:**
```bash
# Local
cd backend
uv add nome-do-pacote
git commit -am "Add dependency"
git push
```

### ❌ Frontend carrega mas API retorna 404

**Causa:** `VITE_API_URL` incorreta

**Solução:**
```
Dashboard → mapa-frontend → Environment → VITE_API_URL
Valor: https://SEU-BACKEND.onrender.com/api (sem barra final)
```

---

## 🎓 Comandos Úteis

### Ver logs em tempo real:
```bash
# Instalar Render CLI (opcional)
npm install -g @render/cli

# Login
render login

# Ver logs
render logs mapa-backend --tail
render logs mapa-frontend --tail
```

### Executar comandos no backend:
```
Dashboard → mapa-backend → Shell

# Exemplos:
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py shell
```

### Backup do banco de dados:
```
Dashboard → mapa-database → Backups → Create Backup
```

---

## 🌐 Domínio Customizado (Opcional)

### Adicionar domínio próprio:

1. **Compre um domínio** (ex: mapadobosque.com.br)
2. **Configure DNS:**
   - Frontend: `CNAME` → `mapa-frontend.onrender.com`
   - Backend: `CNAME` → `mapa-backend.onrender.com`
3. **No Render:**
   ```
   Dashboard → Service → Settings → Custom Domain → Add Domain
   ```
4. **Atualizar settings.py:**
   ```python
   ALLOWED_HOSTS = ['mapadobosque.com.br']
   CSRF_TRUSTED_ORIGINS = ['https://mapadobosque.com.br']
   ```

SSL é **automático** e **gratuito** via Let's Encrypt.

---

## 📚 Recursos Adicionais

- [Render Docs](https://render.com/docs)
- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Render Status](https://status.render.com) - Verificar se há incidentes

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Backend responde em `/api/`
- [ ] Frontend carrega corretamente
- [ ] Login funciona
- [ ] Django Admin acessível (`/admin/`)
- [ ] Cadastro de usuário funciona
- [ ] Reset de senha envia email
- [ ] WBR Analytics carrega dados
- [ ] Redis cache funcionando (verificar logs)
- [ ] PostgreSQL conectado (sem erros de DB)
- [ ] Logs sem erros críticos
- [ ] Health check verde (✅)

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verificar logs** (90% dos problemas aparecem aqui)
2. **Consultar este guia**
3. **Render Community**: [community.render.com](https://community.render.com)
4. **Time de Digitalização do Grupo JCC**

---

## 🎉 Deploy Concluído!

Parabéns! Seu monorepo está no ar no Render com:

✅ Backend Django com API REST
✅ Frontend React otimizado
✅ PostgreSQL para dados
✅ Redis para cache do WBR
✅ HTTPS automático
✅ Deploy contínuo via Git

**URLs Finais:**
- Frontend: `https://mapa-frontend.onrender.com`
- Backend API: `https://mapa-backend.onrender.com/api`
- Django Admin: `https://mapa-backend.onrender.com/admin`

---

**Desenvolvido pelo Time de Digitalização do Grupo JCC** 🚀
