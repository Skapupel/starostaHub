from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.decorators import permission_classes as permission_classes_decorator

from models.user.models import User, Group
from models.user.choices import UserRoleChoices
from models.user.utils import create_user_invite

from core.api.user.serializers import (
    UserSerializer,
    GroupSerializer,
    StrippedUserSerializer,
    UserInviteSerializer,
    CreateUserInviteSerializer,
)
from core.api.user.permissions import IsStarosta, IsStarostaOrStudentInGroup
from core.api.helpers.rest_api import rest_default_response, rest_default_error_response


class UserRolesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return rest_default_response(
            data={"roles": UserRoleChoices.to_list()}, status=status.HTTP_200_OK
        )


class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        return rest_default_response(
            data=UserSerializer(request.user).data, status=status.HTTP_200_OK
        )

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return rest_default_response(
                data=UserSerializer(request.user).data, status=status.HTTP_200_OK
            )
        return rest_default_error_response(
            serializer, status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request):
        request.user.delete()
        return rest_default_response(status=status.HTTP_204_NO_CONTENT)


class AvailableStudentsListAPIView(ListAPIView):
    permission_classes = [IsStarosta]
    serializer_class = StrippedUserSerializer
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        return User.objects.filter(
            role=UserRoleChoices.STUDENT, students_group__isnull=True, is_active=True
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        paginated_queryset = self.paginate_queryset(queryset)
        serializer = self.serializer_class(paginated_queryset, many=True)
        return self.get_paginated_response(serializer.data)


class GroupAPIView(APIView):
    permission_classes = [IsStarostaOrStudentInGroup]
    serializer_class = GroupSerializer

    def get_object(self, pk):
        try:
            return Group.objects.get(pk=pk)
        except Group.DoesNotExist:
            return None

    def get(self, request, pk):
        group = self.get_object(pk)
        if not group:
            return rest_default_error_response(
                data="Group not found", status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, group)

        return rest_default_response(
            data=GroupSerializer(group).data, status=status.HTTP_200_OK
        )

    @permission_classes_decorator([IsStarosta, IsStarostaOrStudentInGroup])
    def patch(self, request, pk):
        group = self.get_object(pk)
        if not group:
            return rest_default_error_response(
                data="Group not found", status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, group)

        serializer = GroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if "students" in request.data:
                group.students.clear()
                for student in request.data["students"]:
                    group.students.add(User.objects.get(pk=student))
            return rest_default_response(
                data=GroupSerializer(group).data, status=status.HTTP_200_OK
            )
        return rest_default_error_response(
            serializer, status=status.HTTP_400_BAD_REQUEST
        )


class UserInviteAPIView(APIView):
    permission_classes = [IsStarostaOrStudentInGroup]
    serializer_class = UserInviteSerializer

    def get_object(self, pk):
        try:
            return Group.objects.get(pk=pk)
        except Group.DoesNotExist:
            return None

    def post(self, request, pk):
        group = self.get_object(pk)
        if not group:
            return rest_default_error_response(
                data="Group not found", status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, group)

        serializer = CreateUserInviteSerializer(data=request.data)
        if serializer.is_valid():
            invite = create_user_invite(
                serializer.validated_data["email"],
                group.pk,
                serializer.validated_data.get("first_name", None),
                serializer.validated_data.get("last_name", None),
                UserRoleChoices.STUDENT,
            )
            return rest_default_response(
                data=UserInviteSerializer(invite).data, status=status.HTTP_200_OK
            )
        return rest_default_error_response(
            serializer, status=status.HTTP_400_BAD_REQUEST
        )
