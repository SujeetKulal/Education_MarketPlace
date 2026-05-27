"""
Views for MCQ assessments — creating tests, taking quizzes, and viewing results.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone

from .models import MCQ, MCQAttempt
from .serializers import (
    MCQSerializer, MCQStudentSerializer,
    MCQAttemptSerializer, MCQSubmitSerializer,
)
from accounts.permissions import IsVerifiedAuthor


class MCQCreateView(generics.CreateAPIView):
    """Authors create MCQ test sets for their materials."""
    serializer_class = MCQSerializer
    permission_classes = [IsVerifiedAuthor]


class MCQDetailView(generics.RetrieveUpdateAPIView):
    """Authors can view/update their MCQ sets."""
    serializer_class = MCQSerializer
    permission_classes = [IsVerifiedAuthor]

    def get_queryset(self):
        return MCQ.objects.filter(material__author=self.request.user.profile)


class MCQStudentView(generics.RetrieveAPIView):
    """
    Student view of an MCQ test — questions without answers.
    Requires enrollment.
    """
    serializer_class = MCQStudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MCQ.objects.filter(material__is_approved=True)

    def retrieve(self, request, *args, **kwargs):
        mcq = self.get_object()
        # Check enrollment
        from commerce.models import Enrollment
        has_access = Enrollment.objects.filter(
            user=request.user.profile,
            material=mcq.material,
            status='ACTIVE',
        ).exists()

        if not has_access and mcq.material.author != request.user.profile:
            return Response({'error': 'Purchase required'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(mcq)
        return Response(serializer.data)


class MCQStudentByMaterialView(generics.RetrieveAPIView):
    """
    Student view of an MCQ test looked up by the parent material's UUID.
    The frontend navigates to /quiz/:materialId, so we need this lookup.
    """
    serializer_class = MCQStudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        material_id = self.kwargs['material_id']
        try:
            mcq = MCQ.objects.select_related('material').get(material_id=material_id)
        except MCQ.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('No MCQ found for this material.')
        return mcq

    def retrieve(self, request, *args, **kwargs):
        mcq = self.get_object()
        from commerce.models import Enrollment
        has_access = Enrollment.objects.filter(
            user=request.user.profile,
            material=mcq.material,
            status='ACTIVE',
        ).exists()

        if not has_access and mcq.material.author != request.user.profile:
            return Response({'error': 'Purchase required'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(mcq)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_mcq_by_material(request, material_id):
    """
    Submit MCQ answers looked up by the parent material's UUID.
    """
    try:
        mcq = MCQ.objects.get(material_id=material_id)
    except MCQ.DoesNotExist:
        return Response({'error': 'MCQ not found'}, status=status.HTTP_404_NOT_FOUND)

    return _grade_and_save(request, mcq)


def _grade_and_save(request, mcq):
    """Shared grading logic: validate, grade, save attempt, return results."""
    serializer = MCQSubmitSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    answers = serializer.validated_data['answers']
    time_taken = serializer.validated_data['time_taken']

    total_correct = 0
    total_questions = len(mcq.questions or [])
    results = []

    for question in (mcq.questions or []):
        q_id = str(question.get('id'))
        user_answer = answers.get(q_id)
        correct = question.get('correct_answer')
        is_correct = user_answer == correct

        if is_correct:
            total_correct += 1

        results.append({
            'id': question.get('id'),
            'question': question.get('question'),
            'options': question.get('options'),
            'correct_answer': correct,
            'user_answer': user_answer,
            'is_correct': is_correct,
            'explanation': question.get('explanation', ''),
        })

    score = (total_correct / total_questions * 100) if total_questions > 0 else 0
    passed = score >= mcq.passing_score

    attempt = MCQAttempt.objects.create(
        user=request.user.profile,
        mcq=mcq,
        answers=answers,
        score=score,
        total_correct=total_correct,
        total_questions=total_questions,
        passed=passed,
        time_taken=time_taken,
        completed_at=timezone.now(),
    )

    return Response({
        'attempt_id': str(attempt.id),
        'score': score,
        'total_correct': total_correct,
        'total_questions': total_questions,
        'passed': passed,
        'passing_score': mcq.passing_score,
        'results': results,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_mcq(request, pk):
    """
    Submit answers for an MCQ test. Auto-grades and returns results.
    """
    try:
        mcq = MCQ.objects.get(pk=pk)
    except MCQ.DoesNotExist:
        return Response({'error': 'MCQ not found'}, status=status.HTTP_404_NOT_FOUND)

    return _grade_and_save(request, mcq)


class MyAttemptsView(generics.ListAPIView):
    """List all MCQ attempts for the current user."""
    serializer_class = MCQAttemptSerializer

    def get_queryset(self):
        return MCQAttempt.objects.filter(user=self.request.user.profile)
