# Como subir o Backend Django com Docker

Este guia mostra como rodar o backend Django usando Docker e Docker Compose.

## Pré-requisitos

- Docker instalado ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose instalado (geralmente vem com Docker Desktop)

## Estrutura dos arquivos Docker

- **Dockerfile** - Define a imagem do container do Django
- **docker-compose.yml** - Orquestra os serviços (web + ngrok)
- **ngrok.yml** - Configuração do ngrok para expor o servidor

## Passo a Passo

### 1. Configurar variáveis de ambiente

Certifique-se de que o arquivo `.secrets/.env` existe com as configurações necessárias:

```bash
cd backend
mkdir -p .secrets
```

Crie o arquivo `.secrets/.env` com o seguinte conteúdo:

```env
# Django
SECRET_KEY=sua-secret-key-super-secreta-aqui
DEBUG=True

# Database (PostgreSQL)
DATABASE_URL=postgresql://usuario:senha@host:5432/nome_do_banco

# Email (Outlook/Office 365)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@outlook.com
EMAIL_HOST_PASSWORD=sua-senha
DEFAULT_FROM_EMAIL=seu-email@outlook.com
```

### 2. Construir a imagem Docker

```bash
cd backend
docker-compose build
```

Isso vai:
- Baixar a imagem base do Python 3.12
- Instalar todas as dependências
- Copiar o código do projeto
- Configurar o ambiente

### 3. Subir os containers

```bash
docker-compose up
```

Ou para rodar em background:

```bash
docker-compose up -d
```

### 4. Verificar se está funcionando

- Backend Django: http://localhost:8000
- Admin Django: http://localhost:8000/admin
- API: http://localhost:8000/api/
- Ngrok Dashboard: http://localhost:4041 (se configurado)

### 5. Ver logs dos containers

```bash
# Ver logs de todos os serviços
docker-compose logs

# Ver logs apenas do web
docker-compose logs web

# Ver logs em tempo real
docker-compose logs -f
```

## Comandos Úteis

### Parar os containers
```bash
docker-compose stop
```

### Parar e remover os containers
```bash
docker-compose down
```

### Reiniciar os containers
```bash
docker-compose restart
```

### Executar comandos dentro do container

```bash
# Acessar o shell do Django
docker-compose exec web python manage.py shell

# Criar superusuário
docker-compose exec web python manage.py createsuperuser

# Rodar migrations
docker-compose exec web python manage.py migrate

# Criar uma migration
docker-compose exec web python manage.py makemigrations

# Acessar o bash do container
docker-compose exec web bash
```

### Limpar tudo e reconstruir

```bash
# Parar e remover containers, redes e volumes
docker-compose down -v

# Rebuild sem cache
docker-compose build --no-cache

# Subir novamente
docker-compose up
```

## Estrutura do docker-compose.yml

```yaml
services:
  web:
    build: .                    # Usa o Dockerfile local
    container_name: mapa-do-bosque-web
    ports:
      - "8000:8000"            # Mapeia porta 8000 do container para 8000 do host
    volumes:
      - .:/app                 # Sincroniza código (hot reload)
      - ./.secrets:/app/.secrets  # Monta secrets
    environment:
      - PYTHONUNBUFFERED=1     # Logs em tempo real
    networks:
      - mapa-network
    restart: unless-stopped    # Reinicia automaticamente

  ngrok:
    image: ngrok/ngrok:latest
    container_name: mapa-do-bosque-ngrok
    command:
      - "start"
      - "--all"
      - "--config"
      - "/etc/ngrok.yml"
    volumes:
      - ./ngrok.yml:/etc/ngrok.yml
    ports:
      - "4041:4040"            # Dashboard do ngrok (mapeado para 4041)
    networks:
      - mapa-network
    depends_on:
      - web
    restart: unless-stopped
```

## Troubleshooting

### Porta 8000 já está em uso
```bash
# Parar processo na porta 8000
sudo lsof -i :8000
sudo kill -9 <PID>

# Ou mudar a porta no docker-compose.yml
ports:
  - "8001:8000"  # Usa porta 8001 no host
```

### Erro de permissão no .secrets
```bash
chmod 755 .secrets
chmod 644 .secrets/.env
```

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs web

# Verificar se há erro no Dockerfile
docker-compose build --no-cache
```

### Banco de dados não conecta
Verifique:
1. Se a `DATABASE_URL` está correta no `.env`
2. Se o banco PostgreSQL está rodando
3. Se as credenciais estão corretas

### Migrations não aplicadas
```bash
docker-compose exec web python manage.py migrate
```

## Desenvolvimento vs Produção

### Desenvolvimento (atual)
- Usa `runserver` (não recomendado para produção)
- Hot reload ativado
- DEBUG=True

### Produção (recomendado)
Altere a última linha do Dockerfile:

```dockerfile
# Em vez de runserver, use gunicorn:
CMD python manage.py migrate && \
    gunicorn mapaconfig.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

## Integração com Frontend

O frontend React deve acessar:
- **Desenvolvimento local**: http://localhost:8000/api/
- **Com ngrok**: https://seu-subdominio.ngrok-free.app/api/

Configure o `.env` do frontend:
```env
VITE_API_URL=http://localhost:8000/api
```

## Ngrok (Opcional)

Para expor seu backend na internet usando ngrok:

1. Configure o `ngrok.yml` com seu authtoken
2. O ngrok estará disponível em http://localhost:4041
3. Copie a URL pública gerada (ex: https://abc123.ngrok-free.app)
4. Use essa URL no frontend para acessar de qualquer lugar

## Próximos Passos

1. ✅ Backend rodando no Docker
2. 📝 Configure o banco de dados PostgreSQL
3. 🔐 Configure as variáveis de ambiente
4. 🚀 Rode migrations e crie superuser
5. 🧪 Teste a API

## Links Úteis

- [Documentação Docker](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Docker Best Practices](https://docs.docker.com/samples/django/)
