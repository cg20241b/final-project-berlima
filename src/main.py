import cv2
import mediapipe as mp
import time
import math


class handDetector:
    def __init__(self, mode=False, maxHands=2, detectionCon=0.5, trackCon=0.5):
        self.mode = mode
        self.maxHands = maxHands
        self.detectionCon = detectionCon
        self.trackCon = trackCon

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
                
            # print(self.lmList[4])
            # cv2.circle(img, (self.lmList[4][1],self.lmList[4][2]), 5, (255, 0, 0), cv2.FILLED)

            # Gambar garis horizontal dari lmList[0] ke kanan sepanjang 200 piksel
            cv2.line(img, (self.lmList[0][1] - 200, self.lmList[0][2]), (self.lmList[0][1] + 200, self.lmList[0][2]), (0, 255, 0), 2)
            cv2.line(img, (self.lmList[0][1], self.lmList[0][2]), (self.lmList[4][1], self.lmList[4][2]), (0, 255, 255), 2)
            result = self.calculateAngle((self.lmList[0][1],self.lmList[0][2]),(self.lmList[4][1],self.lmList[4][2]))
            print(result*-1)
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
            hand_label = hand_info.classification[0].label  # 'Right' atau 'Left'
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
            x2, y2 = self.lmList[12][1], self.lmList[12][2]  # Ujung jari tengah

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
def main():
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
       
        cv2.imshow("Image", img)
        
        # Tambahkan pengecekan untuk tombol 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
