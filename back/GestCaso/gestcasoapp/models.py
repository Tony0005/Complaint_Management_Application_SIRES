from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.crypto import get_random_string
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('El campo Email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    role = models.CharField(max_length=30, default='user')
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Complaint(models.Model):
    title = models.CharField(max_length=100, blank=True)
    identification_number = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    description = models.TextField()
    date = models.DateField(default=timezone.now)
    ESTADO_CHOICES = [
        ('en espera', 'En Espera'),
        ('en tramite', 'En Tramite'),
        ('resuelto', 'Resuelto'),
        ('rechazado', 'Rechazado'),
    ]
    status = models.CharField(
        max_length=100,
        choices=ESTADO_CHOICES,
        default='en_espera'
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    commission = models.ManyToManyField(User, related_name='commission', blank=True)
    assign_complaint = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    deadline = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.description

class ComplaintAttachment(models.Model):
    complaint = models.ForeignKey(Complaint, related_name='attachments', on_delete=models.CASCADE)
    file_add = models.FileField(upload_to='media/')

    def __str__(self):
        return f"Attachment for {self.complaint.id}"


class User_Commission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'complaint')
class ProceedingComplaint(models.Model):
    case = models.ForeignKey(Complaint, related_name='proceedingcomplaint', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.case} / {self.description}"

class ProceedingComplaintAttachment(models.Model):
    proceedingcomplaint = models.ForeignKey(ProceedingComplaint, related_name='attachments', on_delete=models.CASCADE)
    file_add = models.FileField(upload_to='media/')

    def __str__(self):
        return f"Attachment for {self.proceedingcomplaint.id}"

class Answer(models.Model):
    case = models.ForeignKey(Complaint, related_name='answer', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.case} / {self.description}"

class AnswerAttachment(models.Model):
    answer = models.ForeignKey(Answer, related_name='attachments', on_delete=models.CASCADE)
    file_add = models.FileField(upload_to='media/')

    def __str__(self):
        return f"Attachment for {self.answer.id}"

class Area(models.Model):
    name = models.CharField(max_length=100)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_area')
    members = models.ManyToManyField(User, related_name='member_area', blank=True)

    def __str__(self):
        return self.name


class Miembro_Area(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    area = models.ForeignKey(Area, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'area')