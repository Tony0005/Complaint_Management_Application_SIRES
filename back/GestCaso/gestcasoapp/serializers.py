from datetime import datetime

from rest_framework import serializers
from .models import Complaint, User, ProceedingComplaint, Answer, Area, Miembro_Area, User_Commission, ComplaintAttachment, ProceedingComplaintAttachment, AnswerAttachment



class ComplaintAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintAttachment
        fields = '__all__'
class ComplaintSerializer(serializers.ModelSerializer):
    date = serializers.DateField()
    attachments = ComplaintAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'

    def validate_date(self, value):
        if isinstance(value, datetime):
            return value.date()
        return value

    def to_internal_value(self, data):
        if 'date' in data and isinstance(data['date'], datetime):
            data['date'] = data['date'].date()
        return super().to_internal_value(data)



class UserSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True},
            'new_password': {'write_only': True},
        }

    def update(self, instance, validated_data):
        new_password = validated_data.pop('new_password', None)
        if new_password:
            instance.set_password(new_password)

        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        print(validated_data, instance.password)
        print(validated_data, new_password)
        return super().update(instance, validated_data)



class ProceedingComplaintAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProceedingComplaintAttachment
        fields = '__all__'
class ProceedingComplaintSerializer(serializers.ModelSerializer):
    attachments = ProceedingComplaintAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ProceedingComplaint
        fields = '__all__'



class AnswerAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerAttachment
        fields = '__all__'

class AnswerSerializer(serializers.ModelSerializer):
    attachments = AnswerAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Answer
        fields = '__all__'



class AreaSerializer(serializers.ModelSerializer):
    manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    members = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)

    class Meta:
        model = Area
        fields = '__all__'

    def create(self, validated_data):
        members_data = validated_data.pop('members', [])
        area = Area.objects.create(**validated_data)
        area.members.set(members_data)
        return area

    def update(self, instance, validated_data):
        members_data = validated_data.pop('members', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if members_data:
            instance.members.set(members_data)
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class Miembro_AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Miembro_Area
        fields = '__all__'

class User_CommisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Commission
        fields = '__all__'