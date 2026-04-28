from rest_framework import serializers
from .models import Domain, Test, Question, Option, Attempt

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ('id', 'text') # Excludes 'is_correct' to prevent cheating on frontend

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ('id', 'text', 'is_multiple_choice', 'options')

class TestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ('id', 'name', 'order')

class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ('id', 'name', 'description')

class AttemptSerializer(serializers.ModelSerializer):
    test_name = serializers.CharField(source='test.name', read_only=True)
    class Meta:
        model = Attempt
        fields = ('id', 'test_name', 'score', 'passed', 'timestamp')

class QuestionUploadSerializer(serializers.Serializer):
    question = serializers.CharField()
    options = serializers.ListField(child=serializers.CharField())
    answer = serializers.ListField(child=serializers.CharField())
    check_box = serializers.BooleanField()
