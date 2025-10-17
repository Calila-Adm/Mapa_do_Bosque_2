# 🚀 Expor Frontend com Docker + Ngrok

Este guia mostra como expor sua aplicação frontend React/Vite usando Docker e Ngrok.

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado
- Token do Ngrok (já configurado no `ngrok.yml`)

## 🔧 Arquivos Criados

- `docker-compose.yml` - Orquestra o frontend e ngrok
- `Dockerfile.dev` - Imagem Docker para desenvolvimento
- `ngrok.yml` - Configuração do túnel ngrok

## 🚀 Como Usar

### 1️⃣ Iniciar os Containers

Entre na pasta `frontend` e execute:

```bash
cd frontend
docker-compose up -d
```

Isso vai:
- ✅ Construir a imagem do frontend
- ✅ Iniciar o servidor Vite na porta 5173
- ✅ Iniciar o ngrok e criar um túnel público

### 2️⃣ Verificar a URL Pública

Acesse o dashboard do ngrok em:
```
http://localhost:4040
```

Você verá algo assim:
```
Session Status: online
Forwarding: https://abc123.ngrok-free.app -> http://frontend:5173
```

A URL `https://abc123.ngrok-free.app` é sua URL pública! 🎉

### 3️⃣ Compartilhar a Aplicação

Agora você pode compartilhar a URL pública com qualquer pessoa:
- ✅ Funciona na internet
- ✅ Acesso via HTTPS
- ✅ Qualquer pessoa pode acessar

## 📱 Testando

1. Abra a URL do ngrok no navegador: `https://abc123.ngrok-free.app`
2. Teste as rotas:
   - `/` - Home
   - `/login` - Login
   - `/dashboard` - Painel de Operações
   - `/instagram` - Painel do Instagram

## 🔍 Comandos Úteis

### Ver logs dos containers
```bash
docker-compose logs -f
```

### Ver apenas logs do frontend
```bash
docker-compose logs -f frontend
```

### Ver apenas logs do ngrok
```bash
docker-compose logs -f ngrok
```

### Parar os containers
```bash
docker-compose down
```

### Reconstruir e reiniciar
```bash
docker-compose up -d --build
```

### Reiniciar apenas o ngrok (se a URL mudar)
```bash
docker-compose restart ngrok
```

## 🎯 URLs Importantes

- **Frontend Local**: http://localhost:5173
- **Ngrok Dashboard**: http://localhost:4040
- **URL Pública**: Veja no dashboard do ngrok

## 🔐 Segurança

⚠️ **IMPORTANTE**: O `authtoken` do ngrok está exposto no `ngrok.yml`.

Para produção:
1. Use variáveis de ambiente
2. Adicione `ngrok.yml` ao `.gitignore`
3. Considere usar ngrok pago para domínio customizado

## 🐛 Troubleshooting

### Container frontend não inicia
```bash
# Verificar logs
docker-compose logs frontend

# Reconstruir imagem
docker-compose build frontend
```

### Ngrok não cria túnel
```bash
# Verificar configuração
cat ngrok.yml

# Verificar logs
docker-compose logs ngrok

# Testar authtoken manualmente
docker run -it --rm ngrok/ngrok:latest config check
```

### Porta 5173 já em uso
```bash
# Parar processo usando a porta
lsof -ti:5173 | xargs kill -9

# Ou mudar a porta no docker-compose.yml
ports:
  - "3000:5173"  # Usa porta 3000 no host
```

## 📝 Notas

- O ngrok cria uma nova URL toda vez que reinicia (plano free)
- O túnel fica ativo enquanto os containers estiverem rodando
- Hot reload funciona normalmente via ngrok
- Alterações no código são refletidas automaticamente

## 🎨 Estrutura

```
frontend/
├── docker-compose.yml    # Orquestração dos serviços
├── Dockerfile.dev        # Imagem Docker do frontend
├── ngrok.yml             # Configuração do ngrok
├── package.json
├── vite.config.ts
└── src/
    └── ...
```

## ✅ Checklist

- [x] Docker instalado
- [x] docker-compose.yml criado
- [x] Dockerfile.dev criado
- [x] ngrok.yml configurado
- [ ] Containers rodando: `docker-compose up -d`
- [ ] URL pública obtida: http://localhost:4040
- [ ] Testado no navegador
- [ ] Compartilhado com outras pessoas

---

**Pronto!** 🎉 Sua aplicação está acessível publicamente via ngrok!
