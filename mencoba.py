# server.py
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import cv2
import base64

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/')
def index():
    return render_template('index.html')


def capture_video():
    cap = cv2.VideoCapture(0)  # Membuka webcam
    if not cap.isOpened():
        print("Error: Could not open video device")
        return
    print("Video capture started")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame")
            break
        # Mengkodekan frame menjadi format JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        frame_data = base64.b64encode(buffer).decode('utf-8')
        # Mengirim frame melalui socket
        socketio.emit('video_frame', {'frame': frame_data})
        print("Frame emitted")
        # Menunggu sebentar sebelum mengambil frame berikutnya
        socketio.sleep(0.1)
    cap.release()
    print("Video capture stopped")


@socketio.on('connect')
def handle_connect():
    print("Client connected")
    # Mulai capture video di background ketika client terhubung
    socketio.start_background_task(capture_video)


if __name__ == '__main__':
    # Menjalankan server Flask dan SocketIO
    socketio.run(app, host='0.0.0.0', port=5003)
