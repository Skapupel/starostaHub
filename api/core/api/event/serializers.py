from rest_framework import serializers

from core.api.user.serializers import GroupSerializer
from models.event.models import Event


class EventSerializer(serializers.ModelSerializer):
    group = GroupSerializer(read_only=True)
    weekday = serializers.IntegerField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "url",
            "date",
            "time",
            "weekday",
            "recurring",
            "recurring_until",
            "is_active",
            "group",
        ]
