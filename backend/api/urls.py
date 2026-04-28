from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DomainViewSet, TestViewSet, TestQuestionsView,
    SubmitTestView, UserAttemptsView, JSONUploadView
)

router = DefaultRouter()
router.register(r'domains', DomainViewSet, basename='domain')
router.register(r'tests', TestViewSet, basename='test')

urlpatterns = [
    path('', include(router.urls)),
    path('tests/<int:test_id>/questions/', TestQuestionsView.as_view(), name='test-questions'),
    path('tests/<int:test_id>/submit/', SubmitTestView.as_view(), name='test-submit'),
    path('attempts/', UserAttemptsView.as_view(), name='user-attempts'),
    path('upload/', JSONUploadView.as_view(), name='json-upload'),
]
