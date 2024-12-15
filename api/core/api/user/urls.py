from django.urls import path

from core.api.user.views import (
    UserRolesAPIView,
    UserProfileAPIView,
    AvailableStudentsListAPIView,
    GroupAPIView,
    UserInviteAPIView,
    YourGroupAPIView,
    GroupEventsAPIView,
    GroupEventAPIView,
)


urlpatterns = [
    path("roles", UserRolesAPIView.as_view(), name="user-roles"),
    path("profile", UserProfileAPIView.as_view(), name="user-profile"),
    path(
        "available-students",
        AvailableStudentsListAPIView.as_view(),
        name="available-students-list",
    ),
    path("your-group", YourGroupAPIView.as_view(), name="your-group"),
    path("groups/<int:pk>", GroupAPIView.as_view(), name="group"),
    path("groups/<int:pk>/invite", UserInviteAPIView.as_view(), name="group-invite"),
    path("groups/<int:pk>/events", GroupEventsAPIView.as_view(), name="group-events"),
    path(
        "groups/<int:pk>/events/<int:event_id>",
        GroupEventAPIView.as_view(),
        name="group-event",
    ),
]
