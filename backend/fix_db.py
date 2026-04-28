import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import Question, Option

qs = Question.objects.filter(text__icontains="To enable fruitful conversation in a meeting with pluricultural stakeholders")
for q in qs:
    for o in q.options.all():
        if o.text == "Listen to one's interlocutors.":
            o.is_correct = True
            o.save()
        elif o.text == "Give an opportunity to others to have their say.":
            o.is_correct = True
            o.save()
        print(o.text, o.is_correct)

print("Fixed specific question")
