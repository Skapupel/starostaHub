class UserRoleChoices(object):
    ADMIN = "Admin"
    STAROSTA = "Starosta"
    STUDENT = "Student"

    @classmethod
    def get_choices(cls):
        return (
            (cls.ADMIN, "Admin"),
            (cls.STAROSTA, "Starosta"),
            (cls.STUDENT, "Student"),
        )

    @classmethod
    def to_list(cls):
        return [choice[0] for choice in cls.get_choices()]
