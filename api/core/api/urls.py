from django.urls import path, include


urlpatterns = [
    path("auth", include("core.api.auth.urls")),
]
