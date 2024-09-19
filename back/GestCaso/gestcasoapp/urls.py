from django.urls import path, include
from rest_framework import routers
from . import views
from .views import RegisterView, LoginView, AssignComplaintView, AssignMultipleUsersView, UpdateUserRoleView, AssignDeadlineView

router = routers.DefaultRouter()
router.register(r'user', views.UserViewSet)
router.register(r'complaint', views.ComplaintViewSet)
router.register(r'proceeding_complaint', views.ProceedingComplaintViewSet)
router.register(r'miembro_area', views.Miembro_AreaViewSet)
router.register(r'user_commision', views.User_CommisionViewSet)
router.register(r'answer', views.AnswerViewSet)
router.register(r'area', views.AreaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('complaints/my_complaints/', views.ComplaintViewSet.as_view({'get': 'my_complaints'}), name='my_complaints'),
    path('complaints/all_complaints/', views.ComplaintViewSet.as_view({'get': 'all_complaints'}), name='all_complaints'),
    path('complaint/<int:pk>/assign_complaint/', AssignComplaintView.as_view(), name='assign_complaint'),
    path('complaint/<int:pk>/assign_multiple_users/', AssignMultipleUsersView.as_view(), name='assign_multiple_users'),
    path('complaint/<int:pk>/assign_deadline/', AssignDeadlineView.as_view(), name='assign_dead_line'),
    path('user/<int:pk>/update_role/', UpdateUserRoleView.as_view(), name='update_user_role'),
    path('area/members/', views.AreaViewSet.as_view({'get': 'members'}), name='members'),
    path('complaint/<int:pk>/update_status/', views.ComplaintViewSet.as_view({'patch': 'update_status'}), name='update_status')
]

