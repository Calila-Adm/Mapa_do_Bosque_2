# Integração de Autenticação - Front-end + Back-end

Este documento explica como a autenticação foi integrada entre o front-end React e o back-end Django.

## Estrutura Criada

### Back-end (Django)
- **Endpoints de API:**
  - `POST /api/cadastro/` - Cadastro de novo usuário
  - `POST /api/login/` - Login do usuário
  - `POST /api/logout/` - Logout do usuário
  - `POST /api/password-reset/request/` - Solicitar código de recuperação de senha
  - `POST /api/password-reset/confirm/` - Confirmar recuperação de senha com código

### Front-end (React + TypeScript)

#### Arquivos Criados:

1. **[frontend/src/types/auth.types.ts](frontend/src/types/auth.types.ts)**
   - Tipos TypeScript para autenticação
   - Interfaces para User, LoginRequest, CadastroRequest, etc.

2. **[frontend/src/services/api.ts](frontend/src/services/api.ts)**
   - Serviço de comunicação com a API Django
   - Gerencia requisições HTTP com fetch
   - Adiciona automaticamente o token de autenticação nos headers

3. **[frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)**
   - Context React para gerenciar estado global de autenticação
   - Funções: login, logout, cadastro, requestPasswordReset, confirmPasswordReset
   - Armazena token no localStorage

4. **[frontend/src/components/auth/ProtectedRoute.tsx](frontend/src/components/auth/ProtectedRoute.tsx)**
   - Componente para proteger rotas privadas
   - Redireciona para login se não autenticado

5. **[frontend/src/pages/Login.tsx](frontend/src/pages/Login.tsx)** (Atualizado)
   - Integrado com AuthContext
   - Envia credenciais para API do Django
   - Exibe mensagens de erro

6. **[frontend/src/pages/Cadastro.tsx](frontend/src/pages/Cadastro.tsx)** (Novo)
   - Formulário completo de cadastro
   - Validações de senha e domínio de e-mail
   - Integrado com API

7. **[frontend/src/App.tsx](frontend/src/App.tsx)** (Atualizado)
   - Envolvido com AuthProvider
   - Rotas /dashboard e /instagram protegidas
   - Rota /cadastro adicionada

## Como Usar

### 1. Configurar Variáveis de Ambiente

Crie ou edite o arquivo [frontend/.env](frontend/.env):

```env
VITE_API_URL=http://localhost:8000/api
```

### 2. Iniciar o Back-end (Django)

```bash
cd backend
python manage.py runserver
```

O back-end estará disponível em `http://localhost:8000`

### 3. Iniciar o Front-end (React)

```bash
cd frontend
npm run dev
```

O front-end estará disponível em `http://localhost:5173`

## Fluxo de Autenticação

### Cadastro:
1. Usuário acessa `/cadastro`
2. Preenche o formulário com:
   - Username
   - Email corporativo (domínios permitidos)
   - Senha (mínimo 8 caracteres)
   - Dados opcionais (nome, cargo, setor)
3. Ao enviar, a API retorna um token
4. Token é salvo no localStorage
5. Usuário é redirecionado para `/dashboard`

### Login:
1. Usuário acessa `/login`
2. Insere username e senha
3. API valida e retorna token
4. Token é salvo no localStorage
5. Usuário é redirecionado para `/dashboard`

### Rotas Protegidas:
- Se o usuário tentar acessar `/dashboard` ou `/instagram` sem estar autenticado
- Será automaticamente redirecionado para `/login`

### Logout:
- Use o hook `useAuth()` em qualquer componente
- Chame `logout()` para deslogar
- Token será removido do localStorage

## Exemplo de Uso do Hook useAuth

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MeuComponente() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <>
          <p>Bem-vindo, {user?.username}!</p>
          <button onClick={logout}>Sair</button>
        </>
      )}
    </div>
  );
}
```

## Domínios de E-mail Permitidos

Os seguintes domínios são aceitos no cadastro:
- jccbr.com
- iguatemifortaleza.com.br
- bosquegraopara.com.br
- bosquedosipes.com
- calila.com.br

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Cadastro.tsx
│   │   ├── OperationsPanel.tsx (protegida)
│   │   └── InstagramPanel.tsx (protegida)
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── auth.types.ts
│   └── App.tsx
└── .env
```

## Próximos Passos (Opcional)

1. **Buscar dados do usuário após login**
   - Criar endpoint no Django para retornar dados do usuário autenticado
   - Atualizar AuthContext para buscar esses dados

2. **Implementar recuperação de senha**
   - Criar páginas para solicitar e confirmar reset de senha
   - Já existem os métodos no AuthContext

3. **Adicionar refresh token**
   - Implementar lógica de refresh automático do token

4. **Melhorar tratamento de erros**
   - Exibir mensagens de erro mais específicas da API

## Testando

Para testar a integração:

1. Acesse `http://localhost:5173/cadastro`
2. Crie uma conta com um e-mail válido
3. Após o cadastro, você será redirecionado para `/dashboard`
4. Faça logout (implementar botão) e tente fazer login novamente
5. Tente acessar `/dashboard` sem estar logado - você será redirecionado para `/login`

## Observações Importantes

- O token é armazenado no **localStorage**, então persiste entre recarregamentos da página
- O back-end usa **Token Authentication** do Django REST Framework
- As rotas protegidas só são acessíveis com token válido
- O formato do token no header é: `Authorization: Token <token>`
