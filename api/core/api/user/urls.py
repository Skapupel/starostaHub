from django.urls import path

from core.api.user.views import (
    UserRolesAPIView,
    UserProfileAPIView,
    AvailableStudentsListAPIView,
    GroupAPIView,
    UserInviteAPIView,
)


urlpatterns = [
    path("roles", UserRolesAPIView.as_view(), name="user-roles"),
    path("profile", UserProfileAPIView.as_view(), name="user-profile"),
    path(
        "available-students",
        AvailableStudentsListAPIView.as_view(),
        name="available-students-list",
    ),
    path("groups/<int:pk>", GroupAPIView.as_view(), name="group"),
    path("groups/<int:pk>/invite", UserInviteAPIView.as_view(), name="group-invite"),
]
