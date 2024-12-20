from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.contrib.auth.password_validation import validate_password
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from core.api.helpers.rest_api import rest_default_error_response, rest_default_response
from core.api.auth.serializers import UserLoginSerializer, UserRegisterSerializer
from models.user.models import User


class UserLoginAPIView(APIView):
    """
    An endpoint to login a user.
    """
    serializer_class = UserLoginSerializer

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return rest_default_error_response(
                serializer=serializer,
                message="An error occurred during login.",
            )
        qv_user = User.objects.filter(email__iexact=request.data.get("email"))
        if not qv_user.exists():
            return rest_default_error_response(
                data="Username does not exist.",
                message="User not found.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = qv_user.first()

        if not user.check_password(request.data.get("password")):
            return rest_default_error_response(
                data="Invalid password.",
                message="Invalid password.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return rest_default_error_response(
                data="Account pending approval.",
                message="Account pending approval.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_auth = authenticate(
            username=user.username, password=request.data.get("password")
        )

        update_last_login(None, user_auth)
        refresh = RefreshToken.for_user(user_auth)

        response_data = {
            "id": user.id,
            "email": user.email if user.email else user.profile.parent_email,
            "username": user.username,
            "full_name": user.full_name,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

        return rest_default_response(
            data=response_data,
            message="User logged in successfully.",
            status=status.HTTP_200_OK,
        )


class UserRegisterAPIView(APIView):
    serializer_class = UserRegisterSerializer

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return rest_default_error_response(
                serializer=serializer,
                message="An error occurred during registration.",
            )
        user = User()
        user.is_active = True
        user.email = serializer.validated_data["email"]
        user.first_name = serializer.validated_data["first_name"]
        user.last_name = serializer.validated_data["last_name"]
        try:
            validate_password(serializer.validated_data["password"])
        except Exception as e:
            return rest_default_error_response(
                data=e,
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data["password"])
        user.save()

        return rest_default_response(
            message="User registered successfully.",
            status=status.HTTP_201_CREATED,
        )
