from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forums', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumpost',
            name='post_type',
            field=models.CharField(
                choices=[('QUESTION', 'Question'), ('DISCUSSION', 'Discussion')],
                default='DISCUSSION',
                max_length=12,
            ),
        ),
        migrations.AddField(
            model_name='forumpost',
            name='topic',
            field=models.CharField(
                choices=[
                    ('General Discussion', 'General Discussion'),
                    ('Books & Resources', 'Books & Resources'),
                    ('Study Materials', 'Study Materials'),
                    ('Exam Preparation', 'Exam Preparation'),
                ],
                default='General Discussion',
                max_length=50,
            ),
        ),
    ]
