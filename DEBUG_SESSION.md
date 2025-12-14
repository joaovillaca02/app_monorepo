# 🐛 Debug: Problemas de Sessão e Autenticação

## 🔍 Problemas Identificados

### 1. Sessão não persiste ao fechar navegador
**Causa**: `SameSite="None"` requer HTTPS, mas estamos em HTTP (localhost)

### 2. Home retorna 401 após login
**Causa**: Cookie não está sendo enviado corretamente nas requisições

## ✅ Correções Aplicadas

### 1. Mudança de SameSite
```python
# ANTES (não funciona em localhost HTTP)
SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"

# DEPOIS (funciona em localhost HTTP)
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
```

### 2. Configurações Adicionais
```python
SESSION_COOKIE_DOMAIN = None  # Permite localhost
CSRF_COOKIE_DOMAIN = None     # Permite localhost
```

## 🧪 Como Testar e Verificar

### Passo 1: Limpar Cookies Antigos
1. Abra o DevTools (F12)
2. Vá em **Application** > **Cookies**
3. Delete todos os cookies de `localhost:3000` e `localhost:8000`

### Passo 2: Reiniciar Servidor
```bash
# Pare o servidor Django (Ctrl+C)
# Reinicie
cd server/src
python manage.py runserver
```

### Passo 3: Testar Login
1. Acesse http://localhost:3000/login
2. Faça login
3. **Abra DevTools (F12)** e vá em **Application** > **Cookies** > `http://localhost:8000`
4. Você deve ver um cookie chamado `sessionid`

### Passo 4: Verificar Cookie
O cookie `sessionid` deve ter:
- ✅ **Name**: `sessionid`
- ✅ **Value**: (string longa aleatória)
- ✅ **Domain**: `localhost`
- ✅ **Path**: `/`
- ✅ **Expires**: Data futura (30 dias)
- ✅ **HttpOnly**: ✓
- ✅ **Secure**: (vazio)
- ✅ **SameSite**: `Lax`

### Passo 5: Verificar Requisições
No DevTools, vá em **Network**:

1. **Login** (POST /api/login)
   - Response Headers deve conter: `Set-Cookie: sessionid=...`

2. **Home** (GET /)
   - Request Headers deve conter: `Cookie: sessionid=...`

Se o cookie NÃO aparecer na requisição GET /, há um problema!

## 🔧 Troubleshooting

### Problema: Cookie não aparece nas requisições

**Solução**: Verificar se `credentials: "include"` está em TODAS as requisições fetch

```typescript
// ✅ CORRETO
fetch("http://localhost:8000/", {
  credentials: "include"  // IMPORTANTE!
})

// ❌ ERRADO
fetch("http://localhost:8000/")  // Sem credentials
```

### Problema: Cookie expira ao fechar navegador

**Verificar**:
1. Cookie tem data de expiração? (não deve ser "Session")
2. `SESSION_EXPIRE_AT_BROWSER_CLOSE = False` no settings.py?

### Problema: 401 Unauthorized na home

**Causas possíveis**:
1. Cookie não está sendo enviado → Verificar `credentials: "include"`
2. Cookie expirou → Verificar data de expiração
3. Sessão não existe no servidor → Verificar banco de dados

**Debug no backend**:
```python
# Em views.py, adicionar logs
def home(request):
    print(f"User authenticated: {request.user.is_authenticated}")
    print(f"Session key: {request.session.session_key}")
    print(f"Cookies: {request.COOKIES}")
    # ...
```

## 📊 Checklist de Verificação

Antes de reportar problema, verificar:

- [ ] Servidor Django foi reiniciado após mudanças no settings.py
- [ ] Cookies antigos foram deletados
- [ ] Cookie `sessionid` aparece em Application > Cookies
- [ ] Cookie tem data de expiração (não é "Session")
- [ ] Cookie tem `SameSite: Lax`
- [ ] Requisições incluem `credentials: "include"`
- [ ] Cookie aparece nos Request Headers das requisições

## 🎯 Teste Final

Execute este teste completo:

1. **Limpar tudo**:
   - Delete todos os cookies
   - Feche o navegador
   - Reinicie o servidor Django

2. **Login**:
   - Abra http://localhost:3000/login
   - Faça login
   - Verifique se foi redirecionado para home
   - Verifique se a home carrega corretamente

3. **Persistência**:
   - Feche o navegador COMPLETAMENTE
   - Abra novamente
   - Acesse http://localhost:3000
   - Deve estar autenticado (não redirecionar para login)

4. **Refresh**:
   - Na home, pressione F5 (refresh)
   - Deve continuar autenticado
   - Mensagem do backend deve aparecer

## 📝 Logs Úteis

### Backend (Terminal Django):
```
[timestamp] "POST /api/login HTTP/1.1" 200
[timestamp] "GET /api/check-auth HTTP/1.1" 200
[timestamp] "GET / HTTP/1.1" 200
```

### Frontend (Console do Navegador):
```javascript
// Verificar cookies
console.log(document.cookie);

// Verificar autenticação
// Deve mostrar o estado do AuthContext
```

---

Se após seguir todos esses passos ainda houver problemas, compartilhe:
1. Screenshot dos cookies (DevTools > Application > Cookies)
2. Screenshot do Network mostrando a requisição GET / com headers
3. Mensagem de erro exata do console
