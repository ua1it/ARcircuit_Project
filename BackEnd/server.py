from flask import Flask, render_template, Response
from flask import request
from flask import Response
from flask import stream_with_context
import os
import numpy as np
import cv2
import platform
from mss import mss
from PIL import Image

import mediapipe as mp

from detect import main
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_hands = mp.solutions.hands


app = Flask(__name__)

@app.route('/users')
def file_read():
	# 인식된 부품 파일 읽기
    f = open("./runs/labels/im.txt")
    lines = f.readlines()
    return lines

def gen_crop_frames():
    mon = {'left': 160, 'top': 160, 'width': 800, 'height': 500}
    with mss() as sct:
        with mp_hands.Hands(
            model_complexity=0,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5) as hands:
            while True:
                screenShot = sct.grab(mon)
                img = Image.frombytes(
                    'RGB',
                    (screenShot.width, screenShot.height),
                    screenShot.rgb,
                )
                image = np.array(img)
                
                image.flags.writeable = False
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                results = hands.process(image)

                # 이미지에 손 주석을 그립니다.
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(
                            image,
                            hand_landmarks,
                            mp_hands.HAND_CONNECTIONS,
                            mp_drawing_styles.get_default_hand_landmarks_style(),
                            mp_drawing_styles.get_default_hand_connections_style())
                            
                ret, buffer = cv2.imencode('.jpg',image)
                image = buffer.tobytes()
                yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + image + b'\r\n')
@app.route('/det_components')                
def det_components():
    mon = {'left': 160, 'top': 160, 'width': 800, 'height': 500}
    #os.remove("./img/im.jpg")
    with mss() as sct:

        while True:
            screenShot = sct.grab(mon)
            img = Image.frombytes(
                'RGB',
                (screenShot.width, screenShot.height),
                screenShot.rgb,
            )
            image = np.array(img)
            image.flags.writeable = False
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            cv2.imwrite("./img/im.jpg", image)
            ret, buffer = cv2.imencode('.jpg',image)
            main()
            if(os.path.isfile("./runs/labels/im.txt")):
                f = open("./runs/labels/im.txt")
                lines = f.readlines()
                return lines
            else:
                image = buffer.tobytes()
                yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + image + b'\r\n')
                #f = open("./runs/labels/im.txt")
                #lines = f.readline()
                #return lines
# @app.route('/video_feed')
# def video_feed():
#     #Video streaming route. Put this in the src attribute of an img tag
#     return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_crop')
@app.route('/video_components')
def video_components():
    return Response(det_components(), mimetype='multipart/x-mixed-replace; boundary=frame')
def video_crop():
    return Response(gen_crop_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')



if __name__ == "__main__":
    app.run(debug = True)