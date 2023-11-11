from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import speech_recognition


def index(request):
    return render(request, 'index.html')


@csrf_exempt
def recognize(request):
    LANGUAGE = 'ru-RU'
    wav_file = request.FILES['audio_data']
    text = recognize_audio(wav_file, LANGUAGE)
    return HttpResponse(text)


def recognize_audio(file, language: str):
    sample = speech_recognition.WavFile(file)
    r = speech_recognition.Recognizer()

    with sample as audio:
        content = r.record(audio)
        r.adjust_for_ambient_noise(audio)

    try:
        text_data = r.recognize_google(content, language=language)
    except speech_recognition.exceptions.UnknownValueError:
        text_data = "не удалось распознать"

    return text_data