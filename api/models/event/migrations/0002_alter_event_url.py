# Generated by Django 5.1.4 on 2024-12-15 17:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='url',
            field=models.TextField(),
        ),
    ]