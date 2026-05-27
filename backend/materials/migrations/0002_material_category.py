from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('materials', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='category',
            field=models.CharField(
                blank=True,
                choices=[
                    ('Management', 'Management'),
                    ('Finance', 'Finance'),
                    ('Marketing', 'Marketing'),
                    ('Human Resources', 'Human Resources'),
                    ('Operations', 'Operations'),
                    ('Information Technology', 'Information Technology'),
                    ('Entrepreneurship', 'Entrepreneurship'),
                ],
                db_index=True,
                max_length=50,
            ),
        ),
    ]
