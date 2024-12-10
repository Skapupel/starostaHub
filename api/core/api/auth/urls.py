from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from core.api.auth.views import UserLoginView


urlpatterns = [
    path("login", UserLoginView.as_view(), name="token_obtain_pair"),
    path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
]
