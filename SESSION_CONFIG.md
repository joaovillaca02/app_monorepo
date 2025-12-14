# ⏰ Configuração de Sessões Persistentes

## 📋 Configurações Aplicadas

As seguintes configurações foram adicionadas ao `server/src/core/settings.py`:

```python
# Configurações de Sessão Persistente
SESSION_COOKIE_AGE = 2592000  # 30 dias em segundos (30 * 24 * 60 * 60)
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Mantém a sessão mesmo após fechar o navegador
SESSION_SAVE_EVERY_REQUEST = True  # Renova a sessão a cada requisição
```

## 🔧 O que cada configuração faz:

### 1. `SESSION_COOKIE_AGE = 2592000`
- **Duração da sessão**: 30 dias
- O cookie de sessão expira após 30 dias de inatividade
- Você pode ajustar este valor conforme necessário:
  - 1 dia: `86400`
  - 7 dias: `604800`
  - 30 dias: `2592000`
  - 90 dias: `7776000`
  - 1 ano: `31536000`

### 2. `SESSION_EXPIRE_AT_BROWSER_CLOSE = False`
- **Sessão persistente**: O usuário permanece autenticado mesmo após fechar o navegador
- Se `True`: Sessão expira ao fechar o navegador (comportamento padrão)
- Se `False`: Sessão persiste até expirar por tempo (SESSION_COOKIE_AGE)

### 3. `SESSION_SAVE_EVERY_REQUEST = True`
- **Renovação automática**: A cada requisição, o tempo de expiração é renovado
- Exemplo: Se o usuário acessa o sistema no dia 29, a sessão é renovada por mais 30 dias
- Isso significa que o usuário só será deslogado se ficar 30 dias sem acessar o sistema

## 🎯 Comportamento Atual

Com as configurações aplicadas:

```
Usuário faz login
    ↓
Sessão criada com validade de 30 dias
    ↓
Usuário fecha o navegador
    ↓
Sessão PERMANECE ATIVA ✅
    ↓
Usuário abre o navegador novamente
    ↓
Ainda está autenticado ✅
    ↓
A cada página que acessa, sessão é renovada por +30 dias
    ↓
Só será deslogado se:
  - Fizer logout manualmente
  - Ficar 30 dias sem acessar o sistema
```

## 🔒 Segurança

### Configurações de Segurança Atuais (Desenvolvimento):
```python
SESSION_COOKIE_SECURE = False      # Permite HTTP (localhost)
SESSION_COOKIE_HTTPONLY = True     # Protege contra XSS
SESSION_COOKIE_SAMESITE = "None"   # Permite CORS
```

### ⚠️ Para Produção (HTTPS):
```python
SESSION_COOKIE_SECURE = True       # Apenas HTTPS
SESSION_COOKIE_HTTPONLY = True     # Protege contra XSS
SESSION_COOKIE_SAMESITE = "Lax"    # Proteção CSRF melhorada
```

## 🎨 Opções de Personalização

### Opção 1: Diferentes durações para Login vs Signup
Você pode criar uma lógica no backend para definir durações diferentes:

```python
# Em views.py, após django_login()
if remember_me:
    request.session.set_expiry(2592000)  # 30 dias
else:
    request.session.set_expiry(0)  # Expira ao fechar navegador
```

### Opção 2: Checkbox "Lembrar-me" no Frontend
Adicione um checkbox na página de login e envie para o backend:

```typescript
// Frontend
const [rememberMe, setRememberMe] = useState(true);
await login(username, password, rememberMe);

// Backend
@api_view(["POST", "OPTIONS"])
def login(request):
    # ... autenticação ...
    django_login(request, user)
    
    remember_me = data.get("rememberMe", True)
    if remember_me:
        request.session.set_expiry(2592000)  # 30 dias
    else:
        request.session.set_expiry(0)  # Expira ao fechar navegador
```

## 📊 Monitoramento de Sessões

### Ver sessões ativas no Django Admin:
1. Acesse: http://localhost:8000/admin/
2. Navegue para: **Sessions**
3. Você verá todas as sessões ativas com:
   - Session key
   - Data de expiração
   - Dados da sessão

### Limpar sessões expiradas:
```bash
python manage.py clearsessions
```

## 🧪 Como Testar

1. **Faça login** no sistema
2. **Feche o navegador completamente**
3. **Abra o navegador novamente**
4. **Acesse** http://localhost:3000
5. **Resultado esperado**: Você ainda estará autenticado ✅

## 📝 Resumo

| Configuração | Valor | Efeito |
|--------------|-------|--------|
| Duração da sessão | 30 dias | Sessão expira após 30 dias |
| Persiste ao fechar navegador | Sim | Usuário continua logado |
| Renovação automática | Sim | Cada acesso renova por +30 dias |
| Inatividade máxima | 30 dias | Deslogado após 30 dias sem uso |

---

**Tudo configurado!** 🎉 Agora suas sessões são persistentes e o usuário permanecerá autenticado por 30 dias ou até fazer logout manualmente.
