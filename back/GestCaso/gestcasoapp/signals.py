from django.db.models.signals import post_save
from django.dispatch import receiver

# from .models import User
#
#
# @receiver(post_save, sender=User)
# def asociar_usuario_a_areas(sender, instance, created, **kwargs):
#     if created:
#         for area in instance.area_members.all():
#             area.member.add(instance)
#         for area in instance.area_manager.all():
#             area.manager = instance
#         instance.area_members.through.objects.bulk_create([
#             instance.area_members.through(area_id=area.pk, user_id=instance.pk)
#             for area in instance.area_members.all()
#         ])
#         instance.area_manager.through.objects.bulk_create([
#             instance.area_manager.through(area_id=area.pk, user_id=instance.pk)
#             for area in instance.area_manager.all()
#         ])