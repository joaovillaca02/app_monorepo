from django.http import JsonResponse
from django.contrib.auth import (
    authenticate,
    login as django_login,
    logout as django_logout,
)
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
import json


@api_view(["POST", "OPTIONS"])
def login(request):
    """
    Endpoint de login - autentica o usuário e cria uma sessão
    """
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JsonResponse(
                {"error": "Username e password são obrigatórios"}, status=400
            )

        # Autentica o usuário
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Cria a sessão
            django_login(request, user)
            return JsonResponse(
                {
                    "message": "Login realizado com sucesso",
                    "user": user.username,
                    "authenticated": True,
                }
            )
        else:
            return JsonResponse({"error": "Credenciais inválidas"}, status=401)

    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)


@api_view(["POST", "OPTIONS"])
def logout(request):
    """
    Endpoint de logout - encerra a sessão do usuário
    """
    django_logout(request)
    return JsonResponse(
        {"message": "Logout realizado com sucesso", "authenticated": False}
    )


@api_view(["GET"])
@ensure_csrf_cookie
def check_auth(request):
    """
    Endpoint para verificar se o usuário está autenticado
    """
    if request.user.is_authenticated:
        return JsonResponse({"authenticated": True, "user": request.user.username})
    else:
        return JsonResponse({"authenticated": False})


@api_view(["POST", "OPTIONS"])
def signup(request):
    """
    Endpoint de signup - cria um novo usuário e autentica automaticamente
    """
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        confirm_password = data.get("confirmPassword")

        # Validações
        if not username or not password or not confirm_password:
            return JsonResponse(
                {"error": "Todos os campos são obrigatórios"}, status=400
            )

        if password != confirm_password:
            return JsonResponse({"error": "As senhas não coincidem"}, status=400)

        if len(password) < 8:
            return JsonResponse(
                {"error": "A senha deve ter no mínimo 8 caracteres"}, status=400
            )

        if len(username) < 3:
            return JsonResponse(
                {"error": "O nome de usuário deve ter no mínimo 3 caracteres"},
                status=400,
            )

        # Verifica se o usuário já existe
        from django.contrib.auth.models import User

        if User.objects.filter(username=username).exists():
            return JsonResponse(
                {"error": "Este nome de usuário já está em uso"}, status=400
            )

        # Cria o usuário
        user = User.objects.create_user(username=username, password=password)

        # Autentica automaticamente o usuário recém-criado
        django_login(request, user)

        return JsonResponse(
            {
                "message": "Conta criada com sucesso",
                "user": user.username,
                "authenticated": True,
            },
            status=201,
        )

    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Erro ao criar conta: {str(e)}"}, status=500)
