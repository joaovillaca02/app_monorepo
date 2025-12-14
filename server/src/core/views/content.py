from django.http import JsonResponse
from rest_framework.decorators import api_view


@api_view(["GET"])
def home(request):
    """
    Endpoint protegido - requer autenticação
    """
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Não autenticado", "authenticated": False}, status=401
        )

    return JsonResponse(
        {
            "message": "Hello from Django Docker!",
            "user": request.user.username,
            "authenticated": True,
        }
    )
