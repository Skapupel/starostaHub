from datetime import timedelta
from django.utils import timezone

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import ListAPIView
from rest_framework.decorators import permission_classes as permission_classes_decorator

from models.user.models import User, Group
from models.user.choices import UserRoleChoices
from models.user.utils import create_user_invite
from models.event.models import Event

from core.api.user.serializers import (
    UserSerializer,
    GroupSerializer,
    StrippedUserSerializer,
    UserInviteSerializer,
    CreateUserInviteSerializer,
)
from core.api.event.serializers import EventSerializer
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

    def get_queryset(self):
        students = User.objects.filter(
            role=UserRoleChoices.STUDENT, students_group__isnull=True, is_active=True
        )
        return students

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return rest_default_response(data=serializer.data, status=status.HTTP_200_OK)


class YourGroupAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer

    def get(self, request):
        if not request.user.group:
            return rest_default_error_response(
                data="You are not in a group", status=status.HTTP_404_NOT_FOUND
            )
        return rest_default_response(
            data=GroupSerializer(request.user.group).data, status=status.HTTP_200_OK
        )


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
            if "remove_students" in request.data:
                for student in request.data["remove_students"]:
                    group.students.remove(User.objects.get(pk=student))
            if "students" in request.data:
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


class GroupEventsAPIView(APIView):
    permission_classes = [IsStarostaOrStudentInGroup]
    serializer_class = EventSerializer

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

        events = Event.objects.filter(group=group, is_active=True)

        all_events = []
        for event in events:
            all_events.append(event)
            
            if event.recurring and event.recurring_until:
                current_date = event.date + timedelta(days=7)
                while current_date <= event.recurring_until:
                    virtual_event = Event(
                        id=event.id,
                        group=event.group,
                        name=event.name,
                        url=event.url,
                        date=current_date,
                        time=event.time,
                        weekday=current_date.weekday(),
                        recurring=event.recurring,
                        recurring_until=event.recurring_until,
                        is_active=event.is_active
                    )
                    all_events.append(virtual_event)
                    current_date += timedelta(days=7)

        # remove events that are in the past
        all_events = [event for event in all_events if event.date >= timezone.now().date()]

        all_events = sorted(
            all_events,
            key=lambda event: (event.date, event.time),
        )

        serialized_events = EventSerializer(all_events, many=True).data

        return rest_default_response(
            data=serialized_events,
            status=status.HTTP_200_OK,
        )

    @permission_classes_decorator([IsStarosta, IsStarostaOrStudentInGroup])
    def post(self, request, pk):
        group = self.get_object(pk)
        if not group:
            return rest_default_error_response(
                data="Group not found", status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, group)

        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save(group=group)

            serialized_event = EventSerializer(event).data

            return rest_default_response(
                data=serialized_event, status=status.HTTP_200_OK
            )

        return rest_default_error_response(
            serializer=serializer, status=status.HTTP_400_BAD_REQUEST
        )



class GroupEventAPIView(APIView):
    permission_classes = [IsStarostaOrStudentInGroup]
    serializer_class = EventSerializer

    def get_object(self, pk):
        try:
            return Group.objects.get(pk=pk)
        except Group.DoesNotExist:
            return None

    def get(self, request, pk, event_id):
        group = self.get_object(pk)
        if not group:
            return rest_default_error_response(
                data="Group not found", status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, group)

        event = Event.objects.get(pk=event_id)
        if not event:
            return rest_default_error_response(
                data="Event not found", status=status.HTTP_404_NOT_FOUND
            )

        return rest_default_response(
            data=EventSerializer(event).data, status=status.HTTP_200_OK
        )

    @permission_classes_decorator([IsStarosta, IsStarostaOrStudentInGroup])
    def patch(self, request, pk, event_id):
        group = self.get_object(pk)
        if not group:
            return rest_default_error_response(
                data="Group not found", status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, group)

        event = Event.objects.get(pk=event_id)
        if not event:
            return rest_default_error_response(
                data="Event not found", status=status.HTTP_404_NOT_FOUND
            )

        serializer = EventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return rest_default_response(
                data=EventSerializer(event).data, status=status.HTTP_200_OK
            )
        return rest_default_error_response(
            serializer=serializer, status=status.HTTP_400_BAD_REQUEST
        )

    @permission_classes_decorator([IsStarosta, IsStarostaOrStudentInGroup])
    def delete(self, request, pk, event_id):
        group = self.get_object(pk)
        if not group:
            return rest_default_error_response(
                data="Group not found", status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, group)

        event = Event.objects.get(pk=event_id)
        if not event:
            return rest_default_error_response(
                data="Event not found", status=status.HTTP_404_NOT_FOUND
            )

        event.delete()
        return rest_default_response(
            message="Event deleted", status=status.HTTP_204_NO_CONTENT
        )
