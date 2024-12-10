import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser

from models.user.choices import UserRoleChoices
from models.common.models import BaseModelFields


class User(AbstractUser):
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(
        max_length=255,
        choices=UserRoleChoices.get_choices(),
        default=UserRoleChoices.STUDENT,
    )

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username

    @property
    def is_starosta(self):
        return self.role == UserRoleChoices.STAROSTA

    @property
    def students(self):
        if self.is_starosta:
            group, created = self.starosta_group.get_or_create(starosta=self)
            return group.get_students()
        return None

    @property
    def group(self):
        if self.is_starosta:
            group, created = self.starosta_group.get_or_create(starosta=self)
            return group
        else:
            group = self.students_group.first()
            if group:
                return group
        return None

    @staticmethod
    def check_email_unique(email):
        return User.objects.filter(email=email.lower()).exists()

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = UserRoleChoices.ADMIN
        if self.first_name is not None:
            self.first_name = self.first_name.strip()
        if self.last_name is not None:
            self.last_name = self.last_name.strip()
        if self.first_name is not None and self.last_name is not None:
            self.full_name = "{} {}".format(
                self.first_name.capitalize(), self.last_name.capitalize()
            )
        else:
            self.full_name = ""
        self.email = self.email.replace(" ", "").replace("\t", "").lower()
        if not self.username:
            self.username = str(uuid.uuid4())
        if self.is_starosta and not self.starosta_group.exists():
            Group.objects.create(starosta=self)
        return super().save(*args, **kwargs)


class UserInvite(BaseModelFields):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        verbose_name = "User invite"
        verbose_name_plural = "User invites"

    def __str__(self):
        return self.user.email

    def save(self, *args, **kwargs):
        # TODO: Send invite email
        return super().save(*args, **kwargs)


class Group(BaseModelFields):
    name = models.CharField(max_length=255, blank=True)
    starosta = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="starosta_group"
    )
    students = models.ManyToManyField(User, related_name="students_group", blank=True)

    class Meta:
        verbose_name = "Group"
        verbose_name_plural = "Groups"

    def __str__(self):
        return self.name

    def get_students(self):
        return self.students.all()

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = f"Група {self.starosta.first_name}"
        return super().save(*args, **kwargs)
