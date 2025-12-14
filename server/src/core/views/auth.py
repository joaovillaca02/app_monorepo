from django.http import JsonResponse
from django.contrib.auth import (
    authenticate,
    login as django_login,
    logout as django_logout,
)
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
import re


@api_view(["POST", "OPTIONS"])
def login(request):
    """
    Endpoint de login - autentica o usuário e cria uma sessão
    """
    try:
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            return JsonResponse(
                {"error": "Username, email e password são obrigatórios"}, status=400
            )

        # Autentica o usuário
        user = authenticate(request, username=username, email=email, password=password)

        if user is not None:
            # Cria a sessão
            django_login(request, user)
            return JsonResponse(
                {
                    "message": "Login realizado com sucesso",
                    "user": {"username": user.username, "email": user.email},
                    "authenticated": True,
                }
            )
        else:
            return JsonResponse({"error": "Credenciais inválidas"}, status=401)

    except Exception as e:
        return JsonResponse({"error": f"Erro no login: {str(e)}"}, status=500)


@api_view(["POST", "OPTIONS"])
def logout(request):
    """
    Endpoint de logout - encerra a sessão do usuário
    """
    try:
        django_logout(request)
        return JsonResponse(
            {"message": "Logout realizado com sucesso", "authenticated": False}
        )
    except Exception as e:
        return JsonResponse({"error": f"Erro no logout: {str(e)}"}, status=500)


@api_view(["GET"])
@ensure_csrf_cookie
def check_auth(request):
    """
    Endpoint para verificar se o usuário está autenticado
    """
    if request.user.is_authenticated:
        return JsonResponse(
            {
                "authenticated": True,
                "user": {
                    "username": request.user.username,
                    "email": request.user.email,
                },
            }
        )
    else:
        return JsonResponse({"authenticated": False})


@api_view(["POST", "OPTIONS"])
def signup(request):
    """
    Endpoint de signup - cria um novo usuário (inativo) e envia email de confirmação
    """
    try:
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        confirm_password = request.data.get("confirmPassword")

        # Validações
        if not username or not email or not password or not confirm_password:
            return JsonResponse(
                {"error": "Todos os campos são obrigatórios"}, status=400
            )

        if password != confirm_password:
            return JsonResponse({"error": "As senhas não coincidem"}, status=400)

        # (Validações de tamanho/complexidade duplicadas aqui ou movidas para serializer/utils, mas mantendo simples)
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
        if User.objects.filter(username=username).exists():
            return JsonResponse(
                {"error": "Este nome de usuário já está em uso"}, status=400
            )

        # Cria o usuário INATIVO
        user = User.objects.create_user(
            username=username, email=email, password=password
        )
        user.is_active = True  # mudar para false para ativar a verificação de email
        user.save()

        # Gera token de confirmação
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.core.mail import send_mail
        from django.conf import settings

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        verification_link = (
            f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
        )

        # Envia email
        subject = "Confirme seu cadastro"
        message = f"Olá {username},\n\nPor favor, confirme seu email clicando no link abaixo:\n\n{verification_link}\n\nObrigado!"

        send_mail(
            subject,
            message,
            (
                settings.DEFAULT_FROM_EMAIL
                if hasattr(settings, "DEFAULT_FROM_EMAIL")
                else "noreply@app.com"
            ),
            [email],
            fail_silently=False,
        )

        return JsonResponse(
            {
                "message": "Conta criada com sucesso. Verifique seu email para ativar.",
                "pending": True,
                "email": email,
            },
            status=201,
        )

    except Exception as e:
        return JsonResponse({"error": f"Erro ao criar conta: {str(e)}"}, status=500)


@api_view(["POST"])
def verify_email(request):
    """
    Endpoint para verificar o email do usuário
    """
    try:
        uidb64 = request.data.get("uid")
        token = request.data.get("token")

        if not uidb64 or not token:
            return JsonResponse({"error": "Token inválido ou ausente"}, status=400)

        from django.utils.http import urlsafe_base64_decode
        from django.utils.encoding import force_str
        from django.contrib.auth.tokens import default_token_generator

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()

            # Loga o usuário automaticamente (Manter a sessão)
            django_login(request, user)

            return JsonResponse(
                {
                    "message": "Email confirmado com sucesso",
                    "user": {"username": user.username, "email": user.email},
                    "authenticated": True,
                }
            )
        else:
            return JsonResponse(
                {"error": "Link de confirmação inválido ou expirado"}, status=400
            )

    except Exception as e:
        return JsonResponse({"error": f"Erro na verificação: {str(e)}"}, status=500)


@api_view(["POST"])
def update_profile(request):
    """
    Endpoint para atualizar perfil do usuário
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Não autenticado"}, status=401)

    try:
        username = request.data.get("username")
        email = request.data.get("email")

        if username:
            if (
                User.objects.filter(username=username)
                .exclude(id=request.user.id)
                .exists()
            ):
                return JsonResponse(
                    {"error": "Este nome de usuário já está em uso"}, status=400
                )
            request.user.username = username

        if email:
            request.user.email = email

        request.user.save()

        return JsonResponse(
            {
                "message": "Perfil atualizado com sucesso",
                "user": {
                    "username": request.user.username,
                    "email": request.user.email,
                },
            }
        )
    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao atualizar perfil: {str(e)}"}, status=500
        )


@api_view(["POST"])
def update_password(request):
    """
    Endpoint para atualizar a senha do usuário
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Não autenticado"}, status=401)

    try:
        current_password = request.data.get("currentPassword")
        new_password = request.data.get("newPassword")
        confirm_password = request.data.get("confirmPassword")

        if not current_password or not new_password or not confirm_password:
            return JsonResponse(
                {"error": "Todos os campos são obrigatórios"}, status=400
            )

        # Verifica senha atual
        if not request.user.check_password(current_password):
            return JsonResponse({"error": "Senha atual incorreta"}, status=400)

        # Verifica se as novas senhas coincidem
        if new_password != confirm_password:
            return JsonResponse({"error": "As novas senhas não coincidem"}, status=400)

        # Validação de complexidade
        if len(new_password) < 8:
            return JsonResponse(
                {"error": "A nova senha deve ter no mínimo 8 caracteres"}, status=400
            )

        if not re.search(r"[A-Z]", new_password):
            return JsonResponse(
                {"error": "A nova senha deve ter pelo menos uma letra maiúscula"},
                status=400,
            )

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", new_password):
            return JsonResponse(
                {"error": "A nova senha deve ter pelo menos um caractere especial"},
                status=400,
            )

        # Atualiza a senha
        request.user.set_password(new_password)
        request.user.save()

        # Mantém a sessão ativa
        from django.contrib.auth import update_session_auth_hash

        update_session_auth_hash(request, request.user)

        return JsonResponse({"message": "Senha atualizada com sucesso"})

    except Exception as e:
        return JsonResponse({"error": f"Erro ao atualizar senha: {str(e)}"}, status=500)
