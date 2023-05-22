from flask import Flask, jsonify, request
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/image', methods=['POST'])
def post_image():
    image = request.files.get("imagen")
    image.save('upload_image/image output/image.jpg')
    return jsonify({'message': 'Archivo guardado correctamente.'})


if __name__ == '__main__':
    app.run(debug=True, port=8000)
