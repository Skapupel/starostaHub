from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from unfold.admin import ModelAdmin

from models.user.models import User, Group


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    list_display = ["id", "username", "first_name", "last_name"]
    search_fields = ["username", "first_name", "last_name"]
    list_display_links = ["id", "username"]
    fieldsets = [
        (
            None,
            {
                "fields": [
                    "username",
                    "password",
                ]
            },
        ),
        (
            "Personal info",
            {
                "fields": [
                    "first_name",
                    "last_name",
                    "full_name",
                    "email",
                ]
            },
        ),
        (
            "Permissions",
            {
                "fields": [
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ]
            }
        ),
        (
            "important dates",
            {
                "fields": [
                    "last_login",
                    "date_joined",
                ]
            }
        )
    ]



@admin.register(Group)
class GroupAdmin(ModelAdmin):
    list_display = ["id", "name", "starosta"]
    list_display_links = ["id", "name"]
    fieldsets = [
        (
            "Group info",
            {
                "fields": [
                    "name",
                    "starosta",
                    "students",
                ]
            }
        ),
        (
            "Group control",
            {
                "fields": [
                    "deleted",
                ]
            }
        ),
        (
            "Important dates",
            {
                "fields": [
                    "created_at",
                    "updated_at",
                ]
            }
        )
    ]
    readonly_fields = ["created_at", "updated_at"]
    filter_horizontal = ["students"]
