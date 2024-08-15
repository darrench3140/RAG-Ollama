from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS, cross_origin
from populate_database import populate_database
from query import query
import os
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

UPLOAD_FOLDER = 'data'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app, origins=['http://localhost:3000'], support_credentials=True)

@app.route('/')
def getFrontend():
    return render_template("index.html")

@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    files = request.files.getlist('file')

    for file in files:
        if file.filename == '':
            return jsonify({'error': 'No selected file'})
        if file:
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
            logging.info('Added file: %s', file.filename)
        else:
            return jsonify({'error': 'Invalid file format'})
    populate_database()
    return jsonify({'message': 'File uploaded successfully'})

@app.route('/query', methods=['POST'])
def query_ollama():
    json_content = request.json
    question = json_content.get('query')
    logging.info('Query Ollama: %s', question)
    return Response(query(question))

def start_app():
    populate_database()
    app.run(host="0.0.0.0", port=8080, debug=True)

if __name__ == "__main__":
    start_app()