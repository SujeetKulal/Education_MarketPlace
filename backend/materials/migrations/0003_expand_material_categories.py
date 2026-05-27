from django.db import migrations, models


CATEGORY_CHOICES = [
    ('Management', 'Management'),
    ('Finance', 'Finance'),
    ('Marketing', 'Marketing'),
    ('Human Resources', 'Human Resources'),
    ('Operations', 'Operations'),
    ('Information Technology', 'Information Technology'),
    ('Entrepreneurship', 'Entrepreneurship'),
    ('Engineering', 'Engineering'),
    ('Science', 'Science'),
    ('Arts', 'Arts'),
    ('Social Sciences', 'Social Sciences'),
    ('Business', 'Business'),
    ('Law', 'Law'),
    ('Medicine', 'Medicine'),
    ('Pharmacy', 'Pharmacy'),
    ('Other', 'Other'),
]


class Migration(migrations.Migration):

    dependencies = [
        ('materials', '0002_material_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='material',
            name='category',
            field=models.CharField(
                blank=True,
                choices=CATEGORY_CHOICES,
                db_index=True,
                max_length=50,
            ),
        ),
    ]
