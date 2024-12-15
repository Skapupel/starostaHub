from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from models.common.models import BaseModelFields
from models.user.models import Group


class Event(BaseModelFields):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="events")
    name = models.CharField(max_length=255)
    url = models.TextField()
    date = models.DateField()
    time = models.TimeField()
    weekday = models.IntegerField(
        default=0, validators=[MaxValueValidator(6), MinValueValidator(0)]
    )
    recurring = models.BooleanField(default=False)
    recurring_until = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Event"
        verbose_name_plural = "Events"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.weekday = self.date.weekday()
        return super().save(*args, **kwargs)
