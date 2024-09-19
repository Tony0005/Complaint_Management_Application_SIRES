from django.apps import AppConfig


class GestcasoappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gestcasoapp'

    def ready(self):
        import gestcasoapp.signals