"""
Definicion de rutas principales del backend.
Aqui centralizamos los endpoints expuestos a otros servicios (como el front en React).
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls, name="admin"),
    # Rutas para la autenticacion con JWT (Login)
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("core.urls")),  # Endpoint raiz para la API principal
]
