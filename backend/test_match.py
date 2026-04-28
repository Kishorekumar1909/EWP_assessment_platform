clean_answers = [str(ans).strip().rstrip('.') for ans in ["Listen to one's interlocutors", "Give an opportunity to others to have their say", "Refrain from judging others who think differently."]]
clean_opt = "Listen to one's interlocutors.".strip().rstrip('.')
print(repr(clean_opt), 'in', [repr(x) for x in clean_answers], '->', clean_opt in clean_answers)
