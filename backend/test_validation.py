import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from assessments.serializers import MCQSerializer
from assessments.models import MCQ

data = {
    'material': '00000000-0000-0000-0000-000000000000',
    'questions': [
        {
            'id': 1,
            'question': 'Test?',
            'options': ['A', 'B', 'C', 'D'],
            'correct_answer': 0,
            'explanation': ''
        }
    ],
    'timer_limit': 30,
    'passing_score': 60
}

serializer = MCQSerializer(data=data)
if not serializer.is_valid():
    print("ERRORS:", serializer.errors)
else:
    print("VALID")
