from flask import Flask # Flask
import numpy as np
import cv2
from mss import mss
from PIL import Image

app = Flask(__name__)

@app.route('/users')
def users():
	# users 데이터를 Json 형식으로 반환한다
    return {"members": [{ "id" : 1, "name" : "kim" },
    					{ "id" : 2, "name" : "Lee" }]}

# @app.route('/opencv')
# def opencv():
#     mon = {'left': 160, 'top': 160, 'width': 800, 'height': 500}
#     with mss() as sct:
#         while True:
#             screenShot = sct.grab(mon)
#             img = Image.frombytes(
#                 'RGB',
#                 (screenShot.width, screenShot.height),
#                 screenShot.rgb,
#             )
#             img = np.array(img)

#             img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

#             cv2.imshow('device screen', img)
#             if cv2.waitKey(33) & 0xFF in (
#                 ord('q'), 
#                 27, 
#             ):break

           

if __name__ == "__main__":
    app.run(debug = True)