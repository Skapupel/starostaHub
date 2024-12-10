from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from core.api.auth.views import UserLoginAPIView, UserRegisterAPIView


urlpatterns = [
    path("login", UserLoginAPIView.as_view(), name="token_obtain_pair"),
    path("register", UserRegisterAPIView.as_view(), name="user_register"),
    path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
]
