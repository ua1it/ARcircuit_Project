from flask import Flask, render_template, Response
from flask import request
from flask import Response
from flask import stream_with_context

import numpy as np
import cv2
import platform
from mss import mss
from PIL import Image

app = Flask(__name__)

@app.route('/users')
def users():
	# users 데이터를 Json 형식으로 반환한다
    return {"members": [{ "id" : 1, "name" : "kim" },
    					{ "id" : 2, "name" : "Lee" }]}

#camera = cv2.VideoCapture(0)

# def gen_frames():  # generate frame by frame from camera
#     while True:
#         # Capture frame-by-frame
#         success, frame = camera.read()  # read the camera frame
#         if not success:
#             break
#         else:
#             ret, buffer = cv2.imencode('.jpg', frame)
#             frame = buffer.tobytes()
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result


def gen_crop_frames():
    mon = {'left': 160, 'top': 160, 'width': 800, 'height': 500}
    with mss() as sct:
        while True:
            screenShot = sct.grab(mon)
            img = Image.frombytes(
                'RGB',
                (screenShot.width, screenShot.height),
                screenShot.rgb,
            )
            img = np.array(img)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            ret, buffer = cv2.imencode('.jpg',img)
            img = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + img + b'\r\n')

# @app.route('/video_feed')
# def video_feed():
#     #Video streaming route. Put this in the src attribute of an img tag
#     return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_crop')
def video_crop():
    return Response(gen_crop_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')



if __name__ == "__main__":
    app.run(debug = True)