from rest_framework.permissions import BasePermission


class IsStarosta(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_starosta or request.user.is_superuser)
        )


class IsStarostaOrStudentInGroup(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.group.pk == obj.pk or request.user.is_superuser)
        )
