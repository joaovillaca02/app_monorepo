from django.http import JsonResponse
from rest_framework.decorators import api_view
import json


@api_view(["GET", "OPTIONS"])
def get_profile(request):
    """
    Endpoint para obter dados do perfil do usuário autenticado
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Não autenticado"}, status=401)

    return JsonResponse(
        {
            "username": request.user.username,
            "email": request.user.email or "",
            "date_joined": request.user.date_joined.isoformat(),
        }
    )


@api_view(["PUT", "OPTIONS"])
def update_username(request):
    """
    Endpoint para atualizar o nome de usuário
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Não autenticado"}, status=401)

    try:
        data = json.loads(request.body)
        new_username = data.get("username")

        if not new_username:
            return JsonResponse({"error": "Nome de usuário é obrigatório"}, status=400)

        if len(new_username) < 3:
            return JsonResponse(
                {"error": "O nome de usuário deve ter no mínimo 3 caracteres"},
                status=400,
            )

        # Verifica se o novo username já está em uso por outro usuário
        from django.contrib.auth.models import User

        if (
            User.objects.filter(username=new_username)
            .exclude(id=request.user.id)
            .exists()
        ):
            return JsonResponse(
                {"error": "Este nome de usuário já está em uso"}, status=400
            )

        # Atualiza o username
        request.user.username = new_username
        request.user.save()

        return JsonResponse(
            {
                "message": "Nome de usuário atualizado com sucesso",
                "username": request.user.username,
            }
        )

    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao atualizar nome de usuário: {str(e)}"}, status=500
        )


@api_view(["PUT", "OPTIONS"])
def update_password(request):
    """
    Endpoint para atualizar a senha do usuário
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Não autenticado"}, status=401)

    try:
        data = json.loads(request.body)
        current_password = data.get("currentPassword")
        new_password = data.get("newPassword")
        confirm_password = data.get("confirmPassword")

        # Validações
        if not current_password or not new_password or not confirm_password:
            return JsonResponse(
                {"error": "Todos os campos são obrigatórios"}, status=400
            )

        # Verifica se a senha atual está correta
        if not request.user.check_password(current_password):
            return JsonResponse({"error": "Senha atual incorreta"}, status=400)

        # Verifica se as novas senhas coincidem
        if new_password != confirm_password:
            return JsonResponse({"error": "As novas senhas não coincidem"}, status=400)

        # Verifica o tamanho mínimo
        if len(new_password) < 8:
            return JsonResponse(
                {"error": "A nova senha deve ter no mínimo 8 caracteres"}, status=400
            )

        # Atualiza a senha
        request.user.set_password(new_password)
        request.user.save()

        # Atualiza a sessão para não deslogar o usuário
        from django.contrib.auth import update_session_auth_hash

        update_session_auth_hash(request, request.user)

        return JsonResponse({"message": "Senha atualizada com sucesso"})

    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Erro ao atualizar senha: {str(e)}"}, status=500)
