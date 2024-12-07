from flask_socketio import SocketIO, emit
from flask import Flask
import math
import time
import mediapipe as mp
import cv2


class FlaskSocketIOServer:
    def __init__(self, host='0.0.0.0', port=4000, debug=True):
        self.host = host
        self.port = port
        self.debug = debug
        self.app = Flask(__name__)  # Inisialisasi Flask
        # self.app.config['SECRET_KEY'] = 'your_secret_key'
        self.socketio = SocketIO(
            self.app, cors_allowed_origins="*")
        self.setup_socket_events()

    def setup_socket_events(self):
        @self.app.route('/')
        def index():
            # Mengirim frame ke klien
            self.socketio.start_background_task(
                update, self.socketio)

            return "Server is running!"

        @self.socketio.on('connect')
        def on_connect():
            print("Client connected")

            emit('receive_message', {'data': 'Welcome to Flask-SocketIO!'})

        @self.socketio.on('client_event')
        def handle_client_event(data):
            print(f"Data received from client: {data}")
            emit('server_response', {
                 'data': f"Server received: {data}"}, broadcast=True)

    def run(self):
        """Menjalankan server Flask dengan SocketIO."""

        self.socketio.run(self.app, host=self.host,
                          port=self.port, debug=self.debug)


class handDetector:
    def __init__(self, mode=False, maxHands=2, detectionCon=0.5, trackCon=0.5):
        self.mode = mode
        self.maxHands = maxHands
        self.detectionCon = detectionCon
        self.trackCon = trackCon
        self.counter = 0
        self.angle = 0

        self.mpHands = mp.solutions.hands
        self.hands = self.mpHands.Hands(
            static_image_mode=self.mode,
            max_num_hands=self.maxHands,
            min_detection_confidence=self.detectionCon,
            min_tracking_confidence=self.trackCon
        )
        self.mpDraw = mp.solutions.drawing_utils
        self.tipIds = [4, 8, 12, 16, 20]

    def findHands(self, img, draw=True):
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.hands.process(imgRGB)

        if self.results.multi_hand_landmarks:
            for handLms in self.results.multi_hand_landmarks:
                if draw:
                    self.mpDraw.draw_landmarks(
                        img, handLms, self.mpHands.HAND_CONNECTIONS)
        return img

    def findPosition(self, img, handNo=0, draw=True):
        xList = []
        yList = []
        zList = []  # Tambahkan daftar untuk menyimpan nilai kedalaman
        bbox = []
        self.lmList = []

        if self.results.multi_hand_landmarks:
            myHand = self.results.multi_hand_landmarks[handNo]
            for id, lm in enumerate(myHand.landmark):
                h, w, c = img.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                cz = lm.z  # Dapatkan kedalaman (z)

                xList.append(cx)
                yList.append(cy)
                zList.append(cz)  # Simpan nilai z
                self.lmList.append([id, cx, cy, cz])  # Tambahkan z ke lmList

                if draw:
                    cv2.circle(img, (cx, cy), 5, (255, 0, 255), cv2.FILLED)

            xmin, xmax = min(xList), max(xList)
            ymin, ymax = min(yList), max(yList)
            bbox = xmin, ymin, xmax, ymax

            if draw:
                cv2.rectangle(img, (bbox[0] - 20, bbox[1] - 20),
                              (bbox[2] + 20, bbox[3] + 20), (0, 255, 0), 2)

            # print(self.lmList[4][3] * 60)
            cv2.circle(
                img, (self.lmList[8][1], self.lmList[8][2]), 5, (255, 0, 0), cv2.FILLED)

            result2 = self.calculateAngle(
                (self.lmList[4][2], self.lmList[4][3]*60), (self.lmList[0][1], self.lmList[0][2]))
            # print(result2, " ",self.lmList[4][3] * 60)

            # Gambar garis horizontal dari lmList[0] ke kanan sepanjang 200 piksel
            cv2.line(img, (self.lmList[0][1] - 200, self.lmList[0][2]),
                     (self.lmList[0][1] + 200, self.lmList[0][2]), (0, 255, 0), 2)
            cv2.line(img, (self.lmList[0][1], self.lmList[0][2]),
                     (self.lmList[4][1], self.lmList[4][2]), (0, 255, 255), 2)

            result = self.calculateAngle(
                (self.lmList[0][1], self.lmList[0][2]), (self.lmList[4][1], self.lmList[4][2]))
            self.angle = result * -1
        return self.lmList, bbox

    def calculateAngle(self, point1, point2):
        """
        Menghitung sudut (dalam derajat) antara dua titik koordinat dengan sumbu horizontal.

        :param point1: Tuple (x1, y1) untuk titik pertama
        :param point2: Tuple (x2, y2) untuk titik kedua
        :return: Sudut dalam derajat
        """
        x1, y1 = point1
        x2, y2 = point2

        # Hitung delta x dan delta y
        delta_x = x2 - x1
        delta_y = y2 - y1

        # Hitung sudut dalam radian dan konversi ke derajat
        angle_rad = math.atan2(delta_y, delta_x)
        angle_deg = math.degrees(angle_rad)

        return angle_deg

    def detectHandSide(self, handNo=0):
        """
        Mengidentifikasi apakah tangan yang terdeteksi adalah tangan kanan atau kiri.

        :param handNo: Nomor tangan yang ingin dideteksi (misalnya, 0 untuk tangan pertama).
        :return: 'Right' jika tangan kanan, 'Left' jika tangan kiri, atau None jika tidak terdeteksi.
        """
        if self.results.multi_handedness:
            hand_info = self.results.multi_handedness[handNo]
            # 'Right' atau 'Left'
            hand_label = hand_info.classification[0].label
            # hand_score = hand_info.classification[0].score  # Skor kepercayaan
            return hand_label
        else:
            return ""  # Jika tidak ada tangan terdeteksi

    def fingersUp(self):
        fingers = []

        # Cek apakah lmList memiliki data yang cukup
        if len(self.lmList) == 0:
            return fingers

        # Thumb
        if self.lmList[self.tipIds[0]][1] > self.lmList[self.tipIds[0] - 1][1]:
            fingers.append(1)
        else:
            fingers.append(0)

        # 4 Fingers
        for id in range(1, 5):
            if self.lmList[self.tipIds[id]][2] < self.lmList[self.tipIds[id] - 2][2]:
                fingers.append(1)
            else:
                fingers.append(0)

        return fingers

    def findDistance(self, p1, p2, img, draw=True):
        x1, y1 = self.lmList[p1][1], self.lmList[p1][2]
        x2, y2 = self.lmList[p2][1], self.lmList[p2][2]
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

        if draw:
            cv2.circle(img, (x1, y1), 15, (255, 0, 255), cv2.FILLED)
            cv2.circle(img, (x2, y2), 15, (255, 0, 255), cv2.FILLED)
            cv2.line(img, (x1, y1), (x2, y2), (255, 0, 255), 3)
            cv2.circle(img, (cx, cy), 15, (255, 0, 255), cv2.FILLED)

        length = math.hypot(x2 - x1, y2 - y1)
        return length, img, [x1, y1, x2, y2, cx, cy]

    def calculateTiltAngle(self):
        """
        Menghitung sudut kemiringan tangan terhadap sumbu vertikal.
        Gunakan pergelangan tangan (landmark 0) dan ujung jari tengah (landmark 12) sebagai acuan.
        """
        if len(self.lmList) >= 13:  # Pastikan minimal 13 landmark terdeteksi
            # Koordinat pergelangan tangan (wrist) dan ujung jari tengah (middle finger tip)
            x1, y1 = self.lmList[0][1], self.lmList[0][2]  # Pergelangan tangan
            # Ujung jari tengah
            x2, y2 = self.lmList[12][1], self.lmList[12][2]

            # Hitung sudut kemiringan
            delta_x = x2 - x1
            delta_y = y2 - y1

            angle_rad = math.atan2(delta_y, delta_x)  # Sudut dalam radian
            angle_deg = math.degrees(angle_rad)       # Konversi ke derajat

            # Sesuaikan sudut agar sesuai dengan tegak lurus
            # 90 derajat berarti tangan benar-benar horizontal, 0 berarti vertikal lurus
            tilt_angle = 90 - abs(angle_deg)

            return tilt_angle
        else:
            return None

    def isLeft(self):
        if self.angle < 75 and self.angle > 15:
            print("KOMUNIS")
            return True

    def isRight(self):
        if self.angle < 165 and self.angle > 105:
            print("SOSIALIS")
            return True

    def isDown(self):
        # print(self.angle)
        if self.lmList:
            if self.isLeft() and self.lmList[0][2] < self.lmList[20][2]:
                if self.lmList[20][2] > self.lmList[19][2]:
                    self.counter += 1
                    print(self.counter, "baawah kiri")
            elif self.isRight() and self.lmList[0][2] > self.lmList[20][2]:
                if self.lmList[20][2] < self.lmList[19][2]:
                    self.counter += 1
                    print(self.counter, "bawah kanan")
            elif self.angle >= 65 and self.angle <= 105:
                if self.lmList[20][2] > self.lmList[19][2]:
                    print("bawah")
                    return True

    def isUp(self):
        # print(self.angle)
        if self.lmList:
            if self.isLeft():
                if self.lmList[8][2] < self.lmList[5][2]:
                    self.counter += 1
                    print(self.counter, "atas kiri")
            elif self.isRight():
                if self.lmList[8][2] < self.lmList[7][2]:
                    self.counter += 1
                    print(self.counter, "atas kanan")

            else:
                if self.angle >= 65 and self.angle <= 105:
                    if self.lmList[8][2] < self.lmList[5][2]:
                        print("atas")
                        return True

    def isBoost(self):
        if len(self.lmList):
            if self.isLeft():
                if self.lmList[12][2] > self.lmList[10][2]:
                    print("boost kiri")
                    return True
            elif self.isRight():
                if self.lmList[12][2] < self.lmList[10][2]:
                    print("boost kanan")
                    return True
            else:
                if self.lmList[12][1] > self.lmList[10][1]:
                    print("boost")
                    return True
            return False


def update(socketio):
    pTime = 0
    cap = cv2.VideoCapture(0)
    detector = handDetector()

    while True:
        success, img = cap.read()
        if not success:
            break

        img = detector.findHands(img)
        lmList, bbox = detector.findPosition(img)
        handSide = detector.detectHandSide()
        fingers = detector.fingersUp()
        tilt_angle = detector.calculateTiltAngle()

        cTime = time.time()
        fps = 1 / (cTime - pTime)
        pTime = cTime

        cv2.putText(img, str(int(fps)), (10, 70), cv2.FONT_HERSHEY_PLAIN, 3,
                    (255, 0, 255), 3)
        cv2.putText(img, str(handSide), (500, 50), cv2.FONT_HERSHEY_PLAIN, 3,
                    (255, 0, 255), 2)
        # print(fingers)
        # print(handSide)
        # print(tilt_angle)

        # detector.isDown()
        # detector.isUp()

        messages = {
            "a": 0.0,
            "d": 0.0,
            "W": 0,
            "s": 0,
            "b": 0
        }
        messages["a"] = 0.0
        messages["d"] = 0.0
        messages["w"] = 0
        messages["s"] = 0
        messages["b"] = 0

        if detector.isLeft():
            messages["a"] = 1.0
        elif detector.isRight():
            messages["d"] = 1.0

        if detector.isUp():
            messages["w"] = 1
        elif detector.isDown():
            messages["s"] = 1

        if detector.isBoost():
            messages["b"] = 1

        for key, value in messages.items():
            print(f"{key}: {value}")

        messages = ["-", "-", "-"]
        if detector.isLeft():
            messages[0] = "a"
        elif detector.isRight():
            messages[0] = "d"

        if detector.isUp():
            messages[1] = "w"
        elif detector.isDown():
            messages[1] = "s"

        if detector.isBoost():
            messages[2] = "b"
        cv2.imshow("Image", img)

        # Tambahkan pengecekan untuk tombol 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        socketio.emit("receive_message", messages)
        messages = ""
        socketio.sleep(0)
    cap.release()
    cv2.destroyAllWindows()


def main():
    server = FlaskSocketIOServer(host='0.0.0.0', port=4000, debug=True)
    server.run()


if __name__ == "__main__":
    main()