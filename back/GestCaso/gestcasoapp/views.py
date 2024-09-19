from django.shortcuts import render
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView

from .models import Complaint, User, ProceedingComplaint, Answer, Area, Miembro_Area, User_Commission, ComplaintAttachment, ProceedingComplaintAttachment, AnswerAttachment
from .serializers import (ComplaintSerializer, UserSerializer, ProceedingComplaintSerializer, Miembro_AreaSerializer, User_CommisionSerializer, AnswerSerializer,
                          AreaSerializer, RegisterSerializer, LoginSerializer)
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

# Create your views here.


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class UpdateUserRoleView(UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def patch(self, request, *args, **kwargs):
        user_id = kwargs.get('pk')
        new_role = request.data.get('role')

        if not user_id or not new_role:
            return Response({'error': 'user_id and role are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = self.get_object()
            user.role = new_role
            user.save()
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    parser_classes = (MultiPartParser, FormParser,JSONParser)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_complaints(self, request):
        user = request.user
        complaints = Complaint.objects.filter(Q(user=user) | Q(assign_complaint=user) | Q(commission=user)).distinct()
        serializer = self.get_serializer(complaints, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def all_complaints(self, request):
        if request.user.is_staff:
            complaints = Complaint.objects.all()
            serializer = self.get_serializer(complaints, many=True)
            return Response(serializer.data)
        else:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            complaint = serializer.save()


            for file in request.FILES.getlist('file_add'):
                ComplaintAttachment.objects.create(complaint=complaint, file_add=file)

            headers = self.get_success_headers(serializer.data)
            return Response({
                'message': 'success',
                'data': {
                    'identification_number': complaint.identification_number
                }
            }, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        with transaction.atomic():
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            complaint = serializer.save()

            # Procesar nuevos archivos adjuntos si los hay
            if 'file_add' in request.FILES:
                for file in request.FILES.getlist('file_add'):
                    ComplaintAttachment.objects.create(complaint=complaint, file_add=file)

            return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        try:
            print('Request data:', request.data)
            complaint = self.get_object()
            new_status = request.data.get('status')
            if new_status not in dict(Complaint.ESTADO_CHOICES).keys():
                return Response({'error': 'Estado inválido'}, status=status.HTTP_400_BAD_REQUEST)

            complaint.status = new_status
            complaint.save()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AssignComplaintView(APIView):
    def put(self, request, pk, format=None):
        try:
            complaint = Complaint.objects.get(pk=pk)
            assign_user_id = request.data.get('assign_complaint')

            if not assign_user_id:
                return Response({'success': False, 'error': 'El ID de usuario es requerido'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                assign_user_id = int(assign_user_id)  # Convertir el ID a un entero
                assign_user = User.objects.get(pk=assign_user_id)
            except ValueError:
                return Response({'success': False, 'error': 'ID de usuario inválido'}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({'success': False, 'error': 'Usuario no encontrado'}, status=status.HTTP_400_BAD_REQUEST)

            # Asignar usuario a la queja
            complaint.assign_complaint = assign_user
            complaint.save()

            serializer = ComplaintSerializer(complaint)
            return Response({'success': True, 'data': serializer.data})
        except Complaint.DoesNotExist:
            return Response({'success': False, 'error': 'Queja no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AssignMultipleUsersView(APIView):

    def put(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
            users = request.data.get('users', [])

            if not isinstance(users, list):
                return Response({'error': 'La lista de usuarios no es válida'}, status=status.HTTP_400_BAD_REQUEST)

            for user_id in users:
                try:
                    user = User.objects.get(pk=user_id)
                    complaint.commission.add(user)
                except User.DoesNotExist:
                    return Response({'error': f'Usuario con id {user_id} no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            complaint.save()
            return Response({'success': 'Usuarios asignados correctamente'}, status=status.HTTP_200_OK)
        except Complaint.DoesNotExist:
            return Response({'error': 'Queja no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProceedingComplaintViewSet(viewsets.ModelViewSet):
    queryset = ProceedingComplaint.objects.all()
    serializer_class = ProceedingComplaintSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            proceedingcomplaint = serializer.save()

            # Procesar archivos adjuntos si los hay
            for file in request.FILES.getlist('file_add'):
                ProceedingComplaintAttachment.objects.create(proceedingcomplaint=proceedingcomplaint, file_add=file)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
class Miembro_AreaViewSet(viewsets.ModelViewSet):
    queryset = Miembro_Area.objects.all()
    serializer_class = Miembro_AreaSerializer

class User_CommisionViewSet(viewsets.ModelViewSet):
    queryset = User_Commission.objects.all()
    serializer_class = User_CommisionSerializer

class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            answer = serializer.save()

            for file in request.FILES.getlist('file_add'):
                AnswerAttachment.objects.create(answer=answer, file_add=file)

            return Response(serializer.data, status=status.HTTP_201_CREATED)



class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer

    @action(detail=False, methods=['get'])
    def members(self, request, pk=None):
        """
        Devuelve los detalles de todos los usuarios que son miembros de cualquier área.
        """
        areas = Area.objects.all()
        members = set()  # Usamos un set para evitar duplicados

        for area in areas:
            members.update(area.members.all())

        # Convertimos el set a una lista
        members_list = list(members)

        # Serializamos los usuarios completos
        serializer = UserSerializer(members_list, many=True)

        return Response(serializer.data)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': serializer.data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(email=serializer.data['email'], password=serializer.data['password'])
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'email': user.email,
                'role': user.role
            })
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class AssignDeadlineView(APIView):
    def put(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
            deadline = request.data.get('deadline')
            if deadline:
                complaint.deadline = deadline
                complaint.save()
                return Response({'success': True, 'message': 'Tiempo límite asignado con éxito'}, status=status.HTTP_200_OK)
            return Response({'success': False, 'error': 'Debe proporcionar una fecha límite'}, status=status.HTTP_400_BAD_REQUEST)
        except Complaint.DoesNotExist:
            return Response({'success': False, 'error': 'Queja no encontrada'}, status=status.HTTP_404_NOT_FOUND)
