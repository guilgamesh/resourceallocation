from flask import Flask, request, jsonify
from flask_cors import CORS
from DevelopmentDAO import DevelopmentDAO
from start_api_server import start_server

dao = DevelopmentDAO()
dao.open_connection()

app = Flask(__name__)
CORS(app)
        
@app.route('/devapi/organization/<parent_email>', methods=['GET'])
def get_organization(parent_email=''):
    return jsonify(dao.select_organization(parent_email))


start_server(app)