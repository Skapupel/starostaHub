from rest_framework import serializers

from models.user.models import User, Group, UserInvite


class StrippedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
        ]


class GroupSerializer(serializers.ModelSerializer):
    starosta = StrippedUserSerializer(read_only=True)
    students = StrippedUserSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "starosta", "students"]


class UserSerializer(serializers.ModelSerializer):
    group = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "group",
        ]

    def get_group(self, obj):
        return GroupSerializer(obj.group, context=self.context).data


class UserInviteSerializer(serializers.ModelSerializer):
    user = StrippedUserSerializer(read_only=True)

    class Meta:
        model = UserInvite
        fields = ["user", "code"]


class CreateUserInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
