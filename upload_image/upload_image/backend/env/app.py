from flask import Flask, jsonify, request
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/api/data', methods=['GET'])
def get_data():
    data = {'message': '¡Hola desde la API de Flask, como estas?!'}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=8000)
