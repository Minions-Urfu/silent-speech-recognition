Установка:

пишешь в терминале команды: 

cd <путь к папке с проектом>

python -m venv venv

ещё возможно понадобиться это:

venv\Scripts\activate.bat

И устанавливаешь все модули:

pip install django

pip install speech_recognition

pip install pyaudio

pip install wave

1) Запуск сервера:

python manage.py runserver

Потом переходишь по ссылке в терминале

2) Дополнительно:

console_test.py - конслольное приложение для теста, запускается как обычный питоновский файл





