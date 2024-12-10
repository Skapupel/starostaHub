from models.user.models import UserInvite, User, Group
from models.user.choices import UserRoleChoices


def create_user_invite(
    email: str,
    group_id: int,
    first_name: str = None,
    last_name: str = None,
    role: str = UserRoleChoices.STUDENT,
) -> UserInvite:
    user = User()
    user.email = email
    user.first_name = first_name
    user.last_name = last_name
    user.role = role
    user.is_active = False
    user.save()

    group = Group.objects.get(id=group_id)
    group.students.add(user)
    group.save()

    invite = UserInvite(user=user)
    invite.save()

    return invite
