import requests

ENDPOINT = "http://localhost:11434/v1/chat/completions"

teacher_system = {
    "role": "system",
    "content": "You are a helpful teacher. Answer student questions briefly, max 15 words."
}
student_system = {
    "role": "system",
    "content": "You are a curious student. Ask a new question based on teacher response. Max 10 words. Do not answer or explain."
}

teacher_conversation = [teacher_system, {"role": "user", "content": "Explain computer architecture in brief"}]
student_conversation = [student_system]

for i in range(5):
    # Teacher generates
    teacher_payload = {"model": "llama3.2:1b", "temperature": 0.3, "messages": teacher_conversation}
    teacher_reply = requests.post(ENDPOINT, json=teacher_payload)
    teacher_response = teacher_reply.json()['choices'][0]['message']['content'].strip()
    print("Teacher:", teacher_response)

    # Update memories
    teacher_conversation.append({"role": "assistant", "content": teacher_response})
    student_conversation.append({"role": "user", "content": teacher_response})

    # Student generates
    student_payload = {"model": "llama3.2:1b", "temperature": 0.3, "messages": student_conversation}
    student_reply = requests.post(ENDPOINT, json=student_payload)
    student_response = student_reply.json()['choices'][0]['message']['content'].strip()
    print("Student:", student_response)

    # Update memories
    student_conversation.append({"role": "assistant", "content": student_response})
    teacher_conversation.append({"role": "user", "content": student_response})

    # Optional: keep system + last 2 turns (4 messages) to avoid slowing down
    teacher_conversation = [teacher_system] + teacher_conversation[-4:]
    student_conversation = [student_system] + student_conversation[-4:]
    # student_conversation = [student_system] + student_conversation[-4:]
