# Generated by Django 4.2.11 on 2024-08-31 06:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestcasoapp', '0006_complaint_deadline'),
    ]

    operations = [
        migrations.AlterField(
            model_name='complaint',
            name='status',
            field=models.CharField(choices=[('en espera', 'En Espera'), ('en tramite', 'En Tramite'), ('resuelto', 'Resuelto'), ('rechazado', 'Rechazado')], default='en_espera', max_length=100),
        ),
    ]
