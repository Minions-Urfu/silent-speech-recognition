import speech_recognition
import pyaudio
import wave
import os


def select_audio_device():
    p = pyaudio.PyAudio()
    info = p.get_host_api_info_by_index(0)
    numdevices = info.get('deviceCount')
    for i in range(0, numdevices):
        if (p.get_device_info_by_host_api_device_index(0, i).get('maxInputChannels')) > 0:
            print(i, " - ", p.get_device_info_by_host_api_device_index(0, i).get('name'))
    input_device = input('chose your input device index: ')
    return int(input_device)
    

def record_audio(file_name: str, rec_len: int):
    CHUNK = 1024 # определяет форму ауди сигнала
    FRT = pyaudio.paInt16 # шестнадцатибитный формат задает значение амплитуды
    CHAN = 1 # канал записи звука
    RT = 44100 # частота 

    p = pyaudio.PyAudio()
    device_id = select_audio_device()

    stream = p.open(format=FRT,channels=CHAN,rate=RT,input=True,frames_per_buffer=CHUNK, input_device_index=device_id) # открываем поток для записи
    print("speak now: ")
    frames = [] # формируем выборку данных фреймов
    for i in range(0, int(RT / CHUNK * rec_len)):
        data = stream.read(CHUNK)
        frames.append(data)
    print("done")
    stream.stop_stream() # останавливаем и закрываем поток 
    stream.close()
    p.terminate()

    w = wave.open(file_name, 'wb')
    w.setnchannels(CHAN)
    w.setsampwidth(p.get_sample_size(FRT))
    w.setframerate(RT)
    w.writeframes(b''.join(frames))
    w.close()


def recognize_audio(file_name: str, language: str):
    sample = speech_recognition.WavFile(file_name)
    r = speech_recognition.Recognizer()

    with sample as audio:
        content = r.record(audio)
        r.adjust_for_ambient_noise(audio)

    # удаляю временный аудиофайл
    os.remove(OUTPUT)

    try:
        text_data = r.recognize_google(content, language=language)
    except speech_recognition.exceptions.UnknownValueError:
        text_data = "не удалось распознать"

    return text_data


if __name__ == '__main__':
    OUTPUT = 'output.wav' # заменить на 'test.wav', чтобы использовать подготовленный аудио файл
    REC_DURATION_IN_SECONDS = 5
    LANGUAGE = 'ru-RU'

    record_audio(OUTPUT, REC_DURATION_IN_SECONDS)

    text = recognize_audio(OUTPUT, LANGUAGE)
    
    print(text)

