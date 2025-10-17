# Mapa do Bosque - Backend API

API REST desenvolvida em Django para o sistema Mapa do Bosque do Grupo JCC. Esta aplicação fornece autenticação completa com token-based authentication e gerenciamento de usuários para acesso aos dashboards de KPIs dos shoppings.

## =Ë Sobre o Projeto

O backend do Mapa do Bosque é uma API REST que centraliza a autenticação e gerenciamento de usuários para o sistema de visualização de KPIs dos três shoppings do Grupo JCC. Desenvolvido pelo time de Digitalização, o sistema permite que colaboradores acessem dashboards com métricas estratégicas de operações e redes sociais.

## <¯ Funcionalidades

### Autenticação Completa
- **Cadastro de Usuários**: Sistema de registro com validação de domínio de email corporativo
- **Login com Token**: Autenticação via Token Authentication do Django REST Framework
- **Logout**: Invalidação de tokens para segurança
- **Recuperação de Senha**: Sistema de reset com código de 6 dígitos enviado por email (validade de 15 minutos)

### Gestão de Usuários
- **Perfis Corporativos**: Campos personalizados para cargo e setor
- **Validação de Email**: Apenas emails dos domínios autorizados do Grupo JCC
- **Username Automático**: Geração automática baseada em nome e sobrenome
- **Hierarquia de Cargos**: Analista, Gestor, Coordenador, Superintendente, Diretor, Presidente, Acionista, Estagiário

## <× Arquitetura

### Modelos de Dados

#### User (Usuário)
Extensão do modelo AbstractUser do Django com campos personalizados:

```python
{
  "id": 1,
  "username": "joao.silva",  # Gerado automaticamente
  "email": "joao.silva@jccbr.com",
  "first_name": "João",
  "last_name": "Silva",
  "cargo": "Analista",  # Choices: Analista, Gestor, Coordenador, etc.
  "setor": "Digitalização"
}
```

**Campos principais:**
- `username`: Gerado automaticamente a partir do primeiro e último nome (ex: João Silva ’ joao.silva)
- `email`: Obrigatório, deve pertencer aos domínios autorizados
- `password`: Criptografado com hash do Django
- `cargo`: Escolha entre 10 cargos pré-definidos
- `setor`: Texto livre para identificar o departamento

**Domínios de Email Autorizados:**
- `jccbr.com`
- `iguatemifortaleza.com.br`
- `northshoppingjoquei.com.br`
- `northshoppingmaracanau.com.br`

#### PasswordResetToken
Modelo para gerenciar códigos de recuperação de senha:

```python
{
  "user": User,
  "code": "123456",  # Código de 6 dígitos
  "created_at": "2025-10-17T10:30:00Z",
  "is_used": False
}
```

**Recursos:**
- Código aleatório de 6 dígitos numéricos
- Validade de 15 minutos após criação
- Marcação de uso para evitar reutilização
- Limpeza automática de códigos expirados

## = Endpoints da API

### Base URL
```
http://localhost:8000/api/
```

Quando em produção com ngrok:
```
https://[seu-ngrok-id].ngrok-free.app/api/
```

---

### 1. Cadastro de Usuário

**POST** `/api/cadastro/`

Cria uma nova conta de usuário. O username é gerado automaticamente a partir do primeiro e último nome.

**Request Body:**
```json
{
  "first_name": "João",
  "last_name": "Silva",
  "email": "joao.silva@jccbr.com",
  "password": "SenhaForte123!",
  "password2": "SenhaForte123!",
  "cargo": "Analista",
  "setor": "Digitalização"
}
```

**Validações:**
- Email deve pertencer aos domínios autorizados
- Senha deve ter no mínimo 8 caracteres
- Senha e confirmação devem ser iguais
- Email e username devem ser únicos

**Response 201 (Sucesso):**
```json
{
  "message": "Usuário cadastrado com sucesso.",
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

**Response 400 (Erro de Validação):**
```json
{
  "email": ["Este domínio de email não é permitido."],
  "password": ["A senha deve ter no mínimo 8 caracteres."]
}
```

---

### 2. Login

**POST** `/api/login/`

Autentica um usuário e retorna um token de acesso.

**Request Body:**
```json
{
  "username": "joao.silva",
  "password": "SenhaForte123!"
}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Login realizado com sucesso.",
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

**Response 401 (Credenciais Inválidas):**
```json
{
  "error": "Credenciais inválidas."
}
```

**Como usar o token:**
Inclua o token no header de todas as requisições autenticadas:
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

---

### 3. Logout

**POST** `/api/logout/`

Invalida o token do usuário autenticado.

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response 200 (Sucesso):**
```json
{
  "message": "Logout realizado com sucesso."
}
```

**Response 401 (Não Autenticado):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 4. Solicitar Reset de Senha

**POST** `/api/request-password-reset/`

Gera um código de 6 dígitos e envia por email para recuperação de senha.

**Request Body:**
```json
{
  "email": "joao.silva@jccbr.com"
}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Código de recuperação enviado para o seu email.",
  "email": "joao.silva@jccbr.com",
  "expires_in": "15 minutos"
}
```

**Response 404 (Email Não Encontrado):**
```json
{
  "email": ["Usuário com este email não encontrado."]
}
```

**Exemplo de Email Recebido:**
```
Assunto: Recuperação de Senha - Mapa do Bosque

Olá João,

Você solicitou a recuperação de senha para sua conta no Mapa do Bosque.

Seu código de verificação é: 123456

Este código é válido por 15 minutos.

Se você não solicitou essa recuperação, ignore este email.

Atenciosamente,
Equipe Mapa do Bosque
```

---

### 5. Confirmar Reset de Senha

**POST** `/api/password-reset/`

Confirma o reset de senha usando o código recebido por email.

**Request Body:**
```json
{
  "email": "joao.silva@jccbr.com",
  "code": "123456",
  "new_password": "NovaSenhaForte123!",
  "new_password2": "NovaSenhaForte123!"
}
```

**Validações:**
- Código deve ser válido e não expirado (15 minutos)
- Código não pode ter sido usado anteriormente
- Nova senha deve ter no mínimo 8 caracteres
- Nova senha e confirmação devem ser iguais

**Response 200 (Sucesso):**
```json
{
  "message": "Senha alterada com sucesso! Você já pode fazer login com a nova senha."
}
```

**Response 400 (Código Inválido ou Expirado):**
```json
{
  "code": ["Código inválido ou expirado."]
}
```

## =à Tecnologias

- **Python 3.12+**
- **Django 5.1+**: Framework web
- **Django REST Framework**: API REST
- **Token Authentication**: Sistema de autenticação por token
- **SQLite**: Banco de dados (desenvolvimento)
- **CORS Headers**: Configuração para comunicação com frontend

## =æ Instalação

### Pré-requisitos
- Python 3.12 ou superior
- pip (gerenciador de pacotes Python)
- uv (opcional, para gerenciamento mais rápido de dependências)

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd mapa-do-bosque-2/backend
```

2. **Crie e ative um ambiente virtual:**
```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt

# Ou com uv (mais rápido):
uv pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do backend:
```env
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Configuração de Email (para reset de senha)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app
DEFAULT_FROM_EMAIL=noreply@mapadobosque.com
```

5. **Execute as migrações:**
```bash
python manage.py migrate
```

6. **Crie um superusuário (admin):**
```bash
python manage.py createsuperuser
```

7. **Inicie o servidor:**
```bash
python manage.py runserver
```

O servidor estará disponível em: `http://localhost:8000`

## =3 Docker

### Executar com Docker Compose

O projeto inclui configuração Docker para facilitar o deployment:

```bash
# Na raiz do projeto (não dentro de /backend)
docker-compose up -d
```

Isso iniciará:
- **Backend** na porta 8000
- **Frontend** na porta 5173
- **Ngrok** expondo ambos publicamente

### Acessar logs:
```bash
docker-compose logs -f backend
```

### Parar os containers:
```bash
docker-compose down
```

## = Segurança

### Validações Implementadas
-  Autenticação por token (Token Authentication)
-  Validação de domínio de email corporativo
-  Senhas criptografadas com hash do Django
-  Códigos de reset com validade de 15 minutos
-  Marcação de códigos usados (uso único)
-  CORS configurado para permitir frontend

### Configurações de Segurança
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

CORS_ALLOW_ALL_ORIGINS = True  # Apenas para desenvolvimento
```

**  Em Produção:**
- Altere `DEBUG = False`
- Configure `CORS_ALLOWED_ORIGINS` com domínios específicos
- Use variáveis de ambiente para `SECRET_KEY`
- Configure servidor SMTP real para envio de emails
- Use banco de dados PostgreSQL

## =Á Estrutura do Projeto

```
backend/
   api/                        # App principal da API
      migrations/            # Migrações do banco de dados
      admin.py               # Configuração do Django Admin
      models.py              # Modelos User e PasswordResetToken
      serializers.py         # Serializers para validação
      urls.py                # URLs da API
      views.py               # Views (endpoints)
   mapaconfig/                # Configuração do projeto Django
      settings.py            # Configurações do Django
      urls.py                # URLs principais
      wsgi.py                # WSGI para deployment
   manage.py                  # Script de gerenciamento Django
   pyproject.toml             # Dependências do projeto
   Dockerfile                 # Imagem Docker
   ngrok.yml                  # Configuração Ngrok (2 túneis)
   README.md                  # Este arquivo
```

## >ê Testando a API

### Com cURL

**Cadastro:**
```bash
curl -X POST http://localhost:8000/api/cadastro/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "João",
    "last_name": "Silva",
    "email": "joao.silva@jccbr.com",
    "password": "SenhaForte123!",
    "password2": "SenhaForte123!",
    "cargo": "Analista",
    "setor": "Digitalização"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "joao.silva",
    "password": "SenhaForte123!"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:8000/api/logout/ \
  -H "Authorization: Token SEU_TOKEN_AQUI"
```

### Com Postman/Insomnia

Importe as requisições acima ou use a interface gráfica para testar os endpoints.

## =' Configuração do Django Admin

O Django Admin permite gerenciar usuários e tokens manualmente:

1. Acesse: `http://localhost:8000/admin/`
2. Faça login com o superusuário criado
3. Gerencie:
   - Usuários (User)
   - Tokens de autenticação (Token)
   - Códigos de reset de senha (PasswordResetToken)

## =Ý Notas de Desenvolvimento

### Username Automático
O username é gerado automaticamente removendo acentos e convertendo para lowercase:
- `João Silva` ’ `joao.silva`
- `Maria José Santos` ’ `maria.santos`

### Envio de Emails
Em desenvolvimento, os emails são exibidos no console. Para produção, configure:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'seu-email@gmail.com'
EMAIL_HOST_PASSWORD = 'senha-de-app-do-gmail'
```

### CORS
O CORS está configurado para permitir todas as origens em desenvolvimento:
```python
CORS_ALLOW_ALL_ORIGINS = True
```

Em produção, especifique os domínios:
```python
CORS_ALLOWED_ORIGINS = [
    "https://seu-dominio-frontend.com",
    "https://outro-dominio.com",
]
```

## =€ Próximos Passos

- [ ] Implementar endpoints para KPIs de vendas
- [ ] Adicionar endpoints para dados do Instagram
- [ ] Implementar sistema de permissões por cargo
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD
- [ ] Migrar para PostgreSQL em produção
- [ ] Implementar rate limiting
- [ ] Adicionar logs estruturados

## =e Time de Desenvolvimento

Desenvolvido pelo **Time de Digitalização do Grupo JCC**

## =Ä Licença

Propriedade do Grupo JCC - Todos os direitos reservados
