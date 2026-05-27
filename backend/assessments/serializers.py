"""
Serializers for assessments.
"""
from rest_framework import serializers
from .models import MCQ, MCQAttempt


class MCQQuestionSerializer(serializers.Serializer):
    """Serializer for individual MCQ questions."""
    id = serializers.IntegerField()
    question = serializers.CharField()
    options = serializers.ListField(child=serializers.CharField())
    correct_answer = serializers.IntegerField()
    explanation = serializers.CharField(required=False, allow_blank=True)


class MCQSerializer(serializers.ModelSerializer):
    """Full MCQ serializer for authors creating tests."""
    questions = MCQQuestionSerializer(many=True)

    class Meta:
        model = MCQ
        fields = ['id', 'material', 'questions', 'timer_limit', 'passing_score', 'total_questions', 'created_at']
        read_only_fields = ['id', 'total_questions', 'created_at']


class MCQStudentSerializer(serializers.ModelSerializer):
    """
    MCQ serializer for students taking tests.
    Strips correct answers so students can't cheat.
    """
    questions = serializers.SerializerMethodField()
    material_title = serializers.CharField(source='material.title', read_only=True)

    class Meta:
        model = MCQ
        fields = ['id', 'material_title', 'questions', 'timer_limit', 'total_questions']

    def get_questions(self, obj):
        """Return questions without correct answers."""
        return [
            {
                'id': q.get('id'),
                'question': q.get('question'),
                'options': q.get('options', []),
            }
            for q in (obj.questions or [])
        ]


class MCQAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQAttempt
        fields = [
            'id', 'mcq', 'answers', 'score', 'total_correct',
            'total_questions', 'passed', 'time_taken',
            'started_at', 'completed_at',
        ]
        read_only_fields = ['id', 'score', 'total_correct', 'total_questions', 'passed', 'started_at']


class MCQSubmitSerializer(serializers.Serializer):
    """Serializer for submitting MCQ answers."""
    answers = serializers.DictField(child=serializers.IntegerField())
    time_taken = serializers.IntegerField(min_value=0)
