import math
from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from .models import Domain, Test, Question, Option, Attempt
from .serializers import (
    DomainSerializer, TestListSerializer, QuestionSerializer,
    AttemptSerializer, QuestionUploadSerializer
)

class DomainViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer

class TestViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Test.objects.all().order_by('order')
    serializer_class = TestListSerializer
    
    def get_queryset(self):
        domain_id = self.request.query_params.get('domain')
        if domain_id:
            return self.queryset.filter(domain_id=domain_id)
        return self.queryset

class TestQuestionsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, test_id):
        questions = Question.objects.filter(test_id=test_id)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

class SubmitTestView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, test_id):
        # Format: { "answers": { "question_id": ["option_id", ...] } }
        answers = request.data.get('answers', {})
        questions = Question.objects.filter(test_id=test_id).prefetch_related('options')
        
        score = 0
        total = questions.count()
        detailed_results = []

        if total == 0:
            return Response({'error': 'Test has no questions.'}, status=400)

        for q in questions:
            correct_options = set(str(opt.id) for opt in q.options.filter(is_correct=True))
            user_options = set(str(ans) for ans in answers.get(str(q.id), []))
            
            is_correct = (correct_options == user_options)
            if is_correct:
                score += 1
                
            detailed_results.append({
                'question_id': q.id,
                'is_correct': is_correct,
                'correct_options': list(correct_options),
                'user_options': list(user_options)
            })
        
        passed = (score / total) >= 0.8 if total > 0 else False

        attempt = Attempt.objects.create(
            user=request.user,
            test_id=test_id,
            score=score,
            passed=passed
        )
        return Response({
            'attempt': AttemptSerializer(attempt).data,
            'details': detailed_results # Detailed results provided to frontend for review page
        })

class UserAttemptsView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        print()
        attempts = Attempt.objects.filter(user=request.user).order_by('-timestamp')
        return Response(AttemptSerializer(attempts, many=True).data)

class JSONUploadView(views.APIView):
    # Allow any for development, to allow easy post via curl or frontend internal page
    permission_classes = [AllowAny]
    
    @transaction.atomic
    def post(self, request):
        count = 0
        q=""
        try:
                
            data_list = request.data
            if not isinstance(data_list, list):
                return Response({'error': 'Expected a list of JSON objects.'}, status=400)
                
            domain, _ = Domain.objects.get_or_create(name='Articulation')
            last_test = Test.objects.filter(domain=domain).order_by('-order').first()
            start_order = last_test.order + 1 if last_test else 1
            
            questions_chunked = [data_list[i:i+30] for i in range(0, len(data_list), 30)]
            
            for i, chunk in enumerate(questions_chunked):
                test_name = f"Articulation Test {start_order + i}"
                test = Test.objects.create(domain=domain, name=test_name, order=start_order + i)
                
                for q_data in chunk:
                    count += 1
                    q = q_data
                    serializer = QuestionUploadSerializer(data=q_data)
                    if not serializer.is_valid():
                        transaction.set_rollback(True)
                        return Response(serializer.errors, status=400)
                    
                    v_data = serializer.validated_data
                    question = Question.objects.create(
                        test=test,
                        text=v_data['question'],
                        is_multiple_choice=v_data['check_box']
                    )
                    
                    
                    clean_answers = [str(ans).strip().rstrip('.') for ans in v_data['answer']]
                    for opt_text in v_data['options']:
                        clean_opt = str(opt_text).strip().rstrip('.')
                        is_corr = clean_opt in clean_answers
                        Option.objects.create(
                            question=question,
                            text=opt_text,
                            is_correct=is_corr
                        )
            
            return Response({'message': f'Successfully uploaded {len(data_list)} questions into {len(questions_chunked)} tests.'}, status=201)
        except Exception as e:
            transaction.set_rollback(True)
            
            return Response(str(e)+str(count)+"\n"+str(q),status=500)