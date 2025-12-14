# Fluxo de Autenticação Implementado

## 📋 Visão Geral

Sistema completo de autenticação com Django (backend) e Next.js (frontend) usando sessões baseadas em cookies.

## 🔐 Backend (Django)

### Endpoints Criados

1. **`GET /api/check-auth`** - Verifica se o usuário está autenticado
   - Retorna: `{ authenticated: boolean, user?: string }`

2. **`POST /api/login`** - Realiza login
   - Body: `{ username: string, password: string }`
   - Retorna: `{ message: string, user: string, authenticated: true }`
   - Erro: `{ error: string }` (status 401/400)

3. **`POST /api/signup`** - Cria nova conta e autentica automaticamente
   - Body: `{ username: string, password: string, confirmPassword: string }`
   - Validações:
     - Username mínimo 3 caracteres
     - Senha mínimo 8 caracteres
     - Senhas devem coincidir
     - Username deve ser único
   - Retorna: `{ message: string, user: string, authenticated: true }` (status 201)
   - Erro: `{ error: string }` (status 400/500)

4. **`POST /api/logout`** - Realiza logout
   - Retorna: `{ message: string, authenticated: false }`

5. **`GET /`** - Home protegida (requer autenticação)
   - Retorna: `{ message: string, user: string, authenticated: true }`
   - Erro: `{ error: string, authenticated: false }` (status 401)

### Configurações (settings.py)

- **CORS**: Configurado para aceitar credenciais do localhost:3000
- **Sessões**: Cookies configurados com `SameSite='None'` para desenvolvimento
- **CSRF**: Configurado para aceitar requisições do frontend

## 🎨 Frontend (Next.js)

### Estrutura de Componentes

```
src/
├── contexts/
│   └── AuthContext.tsx          # Context de autenticação global
├── components/
│   └── auth-layout-wrapper.tsx  # Wrapper que controla exibição da sidebar
├── app/
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Home (protegida)
│   └── login/
│       └── page.tsx             # Página de login
```

### Fluxo de Autenticação

1. **Inicialização**
   - `AuthContext` é montado no layout raiz
   - Automaticamente chama `check-auth` ao carregar
   - Define estado global: `{ user, isAuthenticated, isLoading }`

2. **Página Home (`/`)**
   - Verifica `isAuthenticated` via `useAuth()`
   - Se não autenticado → redireciona para `/login`
   - Se autenticado → mostra conteúdo + sidebar

3. **Página Login (`/login`)**
   - Verifica `isAuthenticated` via `useAuth()`
   - Se já autenticado → redireciona para `/`
   - Se não autenticado → mostra formulário
   - Ao fazer login → chama endpoint e redireciona para `/`

4. **Sidebar Condicional**
   - `AuthLayoutWrapper` verifica `isAuthenticated`
   - Só renderiza `<SidebarProvider>` + `<AppSidebar>` se autenticado
   - Caso contrário, renderiza apenas `{children}`

### Hooks Disponíveis

```typescript
const { 
  user,           // { username: string } | null
  isAuthenticated, // boolean
  isLoading,      // boolean
  login,          // (username, password) => Promise<void>
  signup,         // (username, password, confirmPassword) => Promise<void>
  logout,         // () => Promise<void>
  checkAuth       // () => Promise<void>
} = useAuth();
```

## 🚀 Como Testar

### Opção 1: Criar conta via Interface (Recomendado)

1. **Iniciar o backend**
   ```bash
   cd server
   python manage.py runserver
   ```

2. **Iniciar o frontend**
   ```bash
   cd client/src
   npm run dev
   ```

3. **Acessar e criar conta**
   - Frontend: http://localhost:3000
   - Será redirecionado para `/login`
   - Clique em "Criar conta"
   - Preencha: usuário (mín. 3 caracteres), senha (mín. 8 caracteres) e confirme a senha
   - Após criar a conta, será automaticamente autenticado e redirecionado para `/` com sidebar visível

### Opção 2: Criar usuário via Django Admin

1. **Criar um superusuário**
   ```bash
   cd server
   python manage.py createsuperuser
   ```

2. **Iniciar os servidores** (passos 1 e 2 da Opção 1)

3. **Acessar**
   - Frontend: http://localhost:3000
   - Será redirecionado para `/login`
   - Use as credenciais criadas no passo 1
   - Após login, será redirecionado para `/` com sidebar visível

## 🔒 Segurança

### Desenvolvimento
- `SESSION_COOKIE_SECURE = False`
- `CSRF_COOKIE_SECURE = False`
- `SESSION_COOKIE_SAMESITE = 'None'`

### Produção (TODO)
- Alterar para `True` os cookies secure
- Usar HTTPS
- Configurar `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS` adequadamente
- Usar variáveis de ambiente para `SECRET_KEY`

## 📝 Próximos Passos (Opcional)

- [ ] Adicionar refresh automático de sessão
- [ ] Implementar "Lembrar-me" (persistent sessions)
- [ ] Adicionar recuperação de senha
- [ ] Implementar rate limiting no login
- [ ] Adicionar logs de auditoria
- [ ] Implementar JWT como alternativa às sessões
