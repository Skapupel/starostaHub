from django.db import models


class BaseModelFields(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def soft_delete(self):
        self.deleted = True
        super(BaseModelFields, self).save()

    def hard_delete(self):
        super(BaseModelFields, self).delete()
