from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('materials', '0003_expand_material_categories'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='about_material',
            field=models.TextField(blank=True, help_text='Detailed description and context shown on the material page'),
        ),
        migrations.AddField(
            model_name='material',
            name='file_size_bytes',
            field=models.PositiveBigIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='material',
            name='language',
            field=models.CharField(blank=True, default='English', max_length=50),
        ),
        migrations.AddField(
            model_name='material',
            name='level',
            field=models.CharField(blank=True, choices=[('Beginner', 'Beginner'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced'), ('Beginner to Intermediate', 'Beginner to Intermediate'), ('All Levels', 'All Levels')], max_length=50),
        ),
        migrations.AddField(
            model_name='material',
            name='page_count',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='material',
            name='topics_covered',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
