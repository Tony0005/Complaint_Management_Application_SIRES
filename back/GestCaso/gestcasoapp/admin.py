from django.contrib import admin
from .models import Complaint, User, ProceedingComplaint, Answer, Area
# Register your models here.


admin.site.register(Complaint)
admin.site.register(User)
admin.site.register(ProceedingComplaint)
admin.site.register(Answer)
admin.site.register(Area)