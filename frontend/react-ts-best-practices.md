# GUIA DEFINITIVO DE MELHORES PRÁTICAS
## React + TypeScript + SWC + ShadCn UI + Tailwind CSS

Você é um desenvolvedor sênior especializado no stack moderno de React. Siga rigorosamente estas práticas ao desenvolver código front-end de alta qualidade.

---

## 🏗️ ESTRUTURA DE PROJETO

```
src/
├── app/                    # App Router (Next.js) ou Routes (Vite)
├── assets/                 # Imagens, fontes, arquivos estáticos
├── components/             # Componentes reutilizáveis
│   ├── ui/                # Componentes ShadCn (gerados automaticamente)
│   ├── layout/            # Header, Footer, Sidebar
│   ├── forms/             # Formulários complexos
│   └── features/          # Componentes específicos de funcionalidades
├── hooks/                 # Custom hooks
├── lib/                   # Configurações e utilitários
│   ├── api.ts            # Configuração do Axios/Fetch
│   └── utils.ts          # Função cn() e helpers
├── pages/                 # Páginas/Views da aplicação (Vite)
├── services/              # Chamadas à API e lógica de integração
├── store/                 # Gerenciamento de estado global (Zustand)
├── types/                 # Definições de tipos TypeScript
├── constants/             # Constantes da aplicação
├── styles/                # globals.css (Tailwind imports)
├── tests/                 # Testes unitários e de integração
└── validators/            # Schemas Zod para validação
```

---

## 🎨 CONFIGURAÇÃO INICIAL: TAILWIND + SHADCN

### 1. INSTALAÇÃO DO TAILWIND CSS

```bash
# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar dependências do ShadCn
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

### 2. CONFIGURAÇÃO DO TAILWIND

```typescript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 3. CONFIGURAÇÃO DO SHADCN

```bash
# Inicializar ShadCn UI
npx shadcn-ui@latest init

# Instalar componentes conforme necessário
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add alert
```

### 4. ARQUIVO DE ESTILOS GLOBAIS

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 5. UTILITÁRIO CN() - ESSENCIAL!

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função essencial para mesclar classes Tailwind
 * Evita conflitos e duplicações de classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 📘 1. TIPAGEM RIGOROSA COM TYPESCRIPT

### REGRAS OBRIGATÓRIAS:
- ❌ **NUNCA use `any`** - prefira `unknown` quando o tipo não é conhecido
- ✅ **SEMPRE defina interfaces** para dados da API
- ✅ **Use tipos explícitos** para props, estados e funções
- ✅ **Configure tsconfig.json** com strict mode
- ✅ **Use Zod para validação em runtime**

### EXEMPLO DE TIPAGEM CORRETA:

```typescript
// types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// validators/user.validator.ts (usando Zod)
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: z.enum(["admin", "user", "guest"]).default("user"),
});

export type UserFormData = z.infer<typeof userSchema>;
```

### TIPAGEM DE PROPS COM SHADCN:

```typescript
// ❌ ERRADO
function UserCard(props: any) {
  return <div>{props.name}</div>;
}

// ✅ CORRETO - Usando componentes ShadCn
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function UserCard({ user, onEdit, onDelete, className }: UserCardProps) {
  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle>{user.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Role: <span className="font-medium">{user.role}</span>
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
            Editar
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(user.id)}
          >
            Deletar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

### TIPAGEM DE HOOKS:

```typescript
// ✅ CORRETO - Tipar estados e funções
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<Error | null>(null);

// ✅ CORRETO - Custom Hook tipado com React Query
import { useQuery, useMutation } from "@tanstack/react-query";

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });
}
```

---

## 🧩 2. MODULARIZAÇÃO DE COMPONENTES COM SHADCN

### PRINCÍPIOS:
- **Single Responsibility**: Cada componente tem UMA responsabilidade
- **Composição**: Combine componentes ShadCn para criar interfaces complexas
- **Reutilização**: Crie wrappers customizados dos componentes ShadCn
- **Tipagem**: Sempre extenda os tipos dos componentes base

### PADRÃO: CONTAINER/PRESENTATIONAL

```typescript
// components/features/UserList.tsx (Presentacional)
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface UserListProps {
  users: User[];
  onUserClick: (user: User) => void;
  isLoading: boolean;
}

export function UserList({ users, onUserClick, isLoading }: UserListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Nenhum usuário encontrado.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={() => onUserClick(user)}
        />
      ))}
    </div>
  );
}

// components/features/UserListContainer.tsx (Container)
import { useNavigate } from "react-router-dom";
import { useUsers } from "@/hooks/useUsers";
import { UserList } from "./UserList";

export function UserListContainer() {
  const { data: users = [], isLoading, error } = useUsers();
  const navigate = useNavigate();

  const handleUserClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar usuários: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <UserList 
      users={users} 
      onUserClick={handleUserClick} 
      isLoading={isLoading} 
    />
  );
}
```

### CUSTOMIZANDO COMPONENTES SHADCN:

```typescript
// components/ui/custom-button.tsx
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export function CustomButton({
  children,
  isLoading,
  loadingText = "Carregando...",
  disabled,
  className,
  ...props
}: CustomButtonProps) {
  return (
    <Button
      className={cn(className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// Uso:
<CustomButton 
  isLoading={mutation.isPending} 
  loadingText="Salvando..."
  onClick={handleSubmit}
>
  Salvar Usuário
</CustomButton>
```

### COMPONENTE DE FORMULÁRIO COM SHADCN + REACT HOOK FORM + ZOD:

```typescript
// components/forms/UserForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type UserFormData } from "@/validators/user.validator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomButton } from "@/components/ui/custom-button";

interface UserFormProps {
  defaultValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ defaultValues, onSubmit, isLoading }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="João Silva" {...field} />
              </FormControl>
              <FormDescription>
                Nome completo do usuário.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="joao@exemplo.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="guest">Convidado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <CustomButton 
          type="submit" 
          isLoading={isLoading}
          className="w-full"
        >
          Salvar
        </CustomButton>
      </form>
    </Form>
  );
}
```

---

## 🗄️ 3. GERENCIAMENTO DE ESTADO

### ESCOLHA A FERRAMENTA CERTA:

| Estado | Ferramenta | Quando Usar |
|--------|-----------|-------------|
| Local | `useState` | Estado de um único componente |
| Compartilhado | `useContext` | 2-3 componentes próximos |
| Global | `Zustand` | Estado global leve e performático |
| Server State | `TanStack Query` | Cache de dados da API |
| Forms | `React Hook Form` | Formulários complexos |

### EXEMPLO COM ZUSTAND (RECOMENDADO):

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data;
          
          set((state) => {
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
          });
        } catch (error) {
          throw new Error('Falha no login');
        }
      },

      logout: () => {
        set((state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        });
      },

      updateUser: (userData) => {
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...userData };
          }
        });
      },
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Uso no componente:
function ProfilePage() {
  const { user, logout } = useAuthStore();

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil de {user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{user.email}</p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={logout}>
            Sair
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### TANSTACK QUERY PARA SERVER STATE:

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { toast } from 'sonner'; // ou use-toast do ShadCn

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id, // Só executa se id existir
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      toast.success('Usuário atualizado!');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário deletado!');
    },
  });
}
```

---

## 🎣 4. CUSTOM HOOKS ESSENCIAIS

### HOOK PARA THEME (DARK MODE):

```typescript
// hooks/useTheme.ts
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}

// Componente ThemeToggle
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### OUTROS HOOKS ÚTEIS:

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// hooks/useMediaQuery.ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Uso:
const isMobile = useMediaQuery('(max-width: 768px)');

// hooks/useCopyToClipboard.ts
export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Copiado para a área de transferência!');
      return true;
    } catch (error) {
      setCopiedText(null);
      toast.error('Falha ao copiar');
      return false;
    }
  };

  return { copiedText, copy };
}
```

---

## 🌐 5. INTEGRAÇÃO COM API

### ESTRUTURA DE SERVICES:

```typescript
// lib/api.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    const message = error.response?.data?.message || 'Erro na requisição';
    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;

// services/user.service.ts
import api from '@/lib/api';
import { User, CreateUserDto, UpdateUserDto } from '@/types/user.types';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users/');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}/`);
    return data;
  },

  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post<User>('/users/', userData);
    return data;
  },

  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}/`, userData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}/`);
  },
};
```

---

## 🎨 6. MELHORES PRÁTICAS COM TAILWIND CSS

### PRINCÍPIOS:
1. **Use a função `cn()`** para mesclar classes condicionalmente
2. **Evite inline styles** - use classes do Tailwind
3. **Crie variantes com `cva`** (class-variance-authority)
4. **Mantenha consistência** com o design system
5. **Use o tema customizado** do tailwind.config

### USANDO CVA PARA VARIANTES:

```typescript
// components/ui/badge.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Uso:
<Badge variant="default">Ativo</Badge>
<Badge variant="destructive">Inativo</Badge>
<Badge variant="outline">Pendente</Badge>
```

### RESPONSIVE DESIGN:

```typescript
// Exemplo de layout responsivo
<div className="container mx-auto px-4">
  {/* Grid responsivo */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map(item => (
      <Card key={item.id} className="hover:shadow-lg transition-shadow">
        {/* Conteúdo */}
      </Card>
    ))}
  </div>

  {/* Flex responsivo */}
  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
    <Button className="w-full md:w-auto">Ação Principal</Button>
    <Button variant="outline" className="w-full md:w-auto">Ação Secundária</Button>
  </div>

  {/* Tipografia responsiva */}
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Título Responsivo
  </h1>

  {/* Espaçamento responsivo */}
  <div className="space-y-4 md:space-y-6 lg:space-y-8">
    {/* Conteúdo */}
  </div>
</div>
```

### ANIMAÇÕES COM TAILWIND:

```typescript
// Usando classes de animação do Tailwind
<div className="animate-pulse">Carregando...</div>
<div className="animate-spin">⚙️</div>
<div className="animate-bounce">↓</div>

// Transições customizadas
<Button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
  Hover me
</Button>

// Animações com Framer Motion + Tailwind
import { motion } from "framer-motion";

<motion.div
  className="bg-primary rounded-lg p-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Conteúdo animado
</motion.div>
```

---

## 🧪 7. TESTES AUTOMATIZADOS

### TESTANDO COMPONENTES SHADCN:

```typescript
// components/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserCard } from './UserCard';

const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserCard Component', () => {
  it('deve renderizar informações do usuário', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
  });

  it('deve chamar onEdit quando botão é clicado', () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(
      <UserCard user={mockUser} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

### TESTANDO HOOKS COM REACT QUERY:

```typescript
// hooks/useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { useUsers } from './useUsers';
import * as userService from '@/services/user.service';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUsers Hook', () => {
  it('deve buscar usuários com sucesso', async () => {
    const mockUsers = [
      { id: '1', name: 'João' } as User,
      { id: '2', name: 'Maria' } as User,
    ];
    
    vi.spyOn(userService.userService, 'getAll').mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });
});
```

---

## ⚡ 8. OTIMIZAÇÕES E PERFORMANCE

```typescript
// 1. LAZY LOADING DE PÁGINAS
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const UserDashboard = lazy(() => import('@/pages/UserDashboard'));

function App() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <UserDashboard />
    </Suspense>
  );
}

// 2. MEMOIZAÇÃO COM useMemo
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// 3. MEMOIZAÇÃO COM useCallback
const handleUserClick = useCallback((user: User) => {
  navigate(`/users/${user.id}`);
}, [navigate]);

// 4. MEMO PARA COMPONENTES
import { memo } from 'react';

const UserItem = memo(({ user, onClick }: UserItemProps) => {
  return (
    <Card onClick={() => onClick(user)} className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
    </Card>
  );
});

// 5. VIRTUAL SCROLLING para listas grandes
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualUserList({ users }: { users: User[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <UserCard user={users[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔒 9. BOAS PRÁTICAS DE SEGURANÇA

```typescript
// 1. VALIDAÇÃO COM ZOD (server-side e client-side)
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

// 2. SANITIZAÇÃO DE HTML
import DOMPurify from 'dompurify';

function DisplayContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// 3. PROTEÇÃO DE ROTAS
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Uso nas rotas:
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile" element={<Profile />} />
</Route>

// 4. RATE LIMITING NO CLIENT (prevenir spam)
import { useState, useEffect } from 'react';

function useRateLimit(limit: number = 5, windowMs: number = 60000) {
  const [attempts, setAttempts] = useState<number[]>([]);

  const isRateLimited = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    return recentAttempts.length >= limit;
  };

  const recordAttempt = () => {
    setAttempts(prev => [...prev, Date.now()]);
  };

  return { isRateLimited, recordAttempt };
}
```

---

## 📋 CHECKLIST DE QUALIDADE

Antes de fazer commit, verifique:

### TypeScript & Tipagem
- [ ] ✅ Nenhum `any` no código
- [ ] ✅ Todas as interfaces estão tipadas
- [ ] ✅ Props são tipadas com interfaces
- [ ] ✅ Validação Zod implementada em formulários

### Componentes & Estrutura
- [ ] ✅ Componentes seguem Single Responsibility
- [ ] ✅ Não há props drilling excessivo (máx 2 níveis)
- [ ] ✅ Componentes reutilizáveis estão na pasta `/components/ui`
- [ ] ✅ Container/Presentational pattern aplicado

### Estado & Dados
- [ ] ✅ Estados complexos estão em Zustand
- [ ] ✅ Dados da API usam TanStack Query
- [ ] ✅ Custom hooks para lógica reutilizável

### Estilização
- [ ] ✅ Usando função `cn()` para merge de classes
- [ ] ✅ Classes Tailwind seguem padrão mobile-first
- [ ] ✅ Design system do ShadCn respeitado
- [ ] ✅ Dark mode funcional

### Qualidade & Performance
- [ ] ✅ Tratamento de erros implementado
- [ ] ✅ Loading states implementados
- [ ] ✅ Lazy loading aplicado onde necessário
- [ ] ✅ Memoização (memo, useMemo) aplicada

### Testes & Segurança
- [ ] ✅ Testes cobrem casos principais
- [ ] ✅ Inputs do usuário são validados
- [ ] ✅ Rotas protegidas implementadas

### Código Limpo
- [ ] ✅ Código está formatado (Prettier)
- [ ] ✅ Sem warnings do ESLint
- [ ] ✅ Sem console.logs desnecessários
- [ ] ✅ Comentários apenas onde necessário

---

## 🎯 REGRAS DE OURO

1. **Type Safety First**: TypeScript é seu aliado, não seu inimigo
2. **Componentes Pequenos**: Se passou de 200 linhas, refatore
3. **Composição > Herança**: Use componentes ShadCn como blocos
4. **DRY**: Extraia lógica repetida em hooks/utils
5. **Performance**: Use React DevTools Profiler
6. **Acessibilidade**: ShadCn já ajuda, mas não negligencie ARIA
7. **Error Boundaries**: Sempre tenha fallback
8. **Loading States**: Nunca deixe usuário sem feedback
9. **Tailwind**: Use a função `cn()` SEMPRE
10. **Code Review**: Todo código deve ser revisado

---

## 🚀 CONFIGURAÇÕES FINAIS

### TSCONFIG.JSON RECOMENDADO

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Strict Mode */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    
    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### ESLINT + PRETTIER

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react-refresh"],
  "rules": {
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_" 
    }]
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### VITE.CONFIG.TS

```typescript
import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
})
```

---

## 📚 COMANDOS ÚTEIS

```bash
# Instalar todas as dependências recomendadas
npm install -D tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install @tanstack/react-query
npm install zustand immer
npm install react-hook-form @hookform/resolvers zod
npm install axios
npm install sonner # ou react-hot-toast

# Instalar componentes ShadCn frequentemente usados
npx shadcn-ui@latest add button input card dialog form toast
npx shadcn-ui@latest add dropdown-menu table sheet alert skeleton
npx shadcn-ui@latest add select checkbox radio-group switch
npx shadcn-ui@latest add avatar badge separator tabs

# Dev Tools
npm install -D @tanstack/react-query-devtools
npm install -D @types/node # Para path resolver

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
```

---

## 🎓 EXEMPLO COMPLETO: CRUD DE USUÁRIOS

```typescript
// pages/UsersPage.tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUsers';
import { UserForm } from '@/components/forms/UserForm';
import { UserList } from '@/components/features/UserList';
import { Skeleton } from '@/components/ui/skeleton';

export function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const handleCreateUser = async (data: UserFormData) => {
    await createUser.mutateAsync(data);
    setIsDialogOpen(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      await deleteUser.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <UserForm 
              onSubmit={handleCreateUser}
              isLoading={createUser.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <UserList 
        users={users}
        onUserClick={(user) => console.log('User clicked:', user)}
        onDelete={handleDeleteUser}
        isLoading={isLoading}
      />
    </div>
  );
}
```

---

## ✨ CONCLUSÃO

Este guia cobre as melhores práticas modernas para desenvolvimento React com TypeScript, SWC, ShadCn UI e Tailwind CSS. Seguir estas diretrizes garante:

- ✅ **Código type-safe e mantível**
- ✅ **Componentes reutilizáveis e escaláveis**
- ✅ **Performance otimizada**
- ✅ **UI consistente e acessível**
- ✅ **Desenvolvimento ágil com ShadCn**
- ✅ **Estilização profissional com Tailwind**

**LEMBRE-SE**: Estas práticas não são regras rígidas, mas diretrizes testadas e aprovadas pela comunidade. Adapte conforme as necessidades do seu projeto, mas sempre priorize qualidade, manutenibilidade e experiência do usuário.

---

**Desenvolvido com ❤️ por desenvolvedores, para desenvolvedores.**