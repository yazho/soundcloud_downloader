from flask import Flask, request, jsonify
import subprocess
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={
    r"/download": {
        "origins": "*",
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/download', methods=['OPTIONS'])
def download_options():
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
    return response, 200

@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    url = data.get('url')
    directory = data.get('directory')
    
    if not url or not directory:
        response = jsonify({'error': 'Aucun lien ou répertoire fourni'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 400
    
    try:
        # Utiliser le chemin absolu pour le répertoire de téléchargement
        download_path = directory  # Utiliser directement le chemin fourni par Electron
        os.makedirs(download_path, exist_ok=True)
        
        # Étape 1: Télécharger le fichier audio
        subprocess.run([
            "yt-dlp",
            "-f", "bestaudio",
            "-x",  # Extract audio
            "--audio-format", "wav",  # Convertir en WAV
            "--audio-quality", "0",  # Meilleure qualité
            "--output", os.path.join(download_path, "%(title)s.%(ext)s"),
            url
        ], check=True)
        
        response = jsonify({'message': 'Téléchargement terminé !'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
        
    except subprocess.CalledProcessError as e:
        response = jsonify({'error': f'Erreur yt-dlp: {str(e)}'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500
    except Exception as e:
        response = jsonify({'error': f'Erreur: {str(e)}'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)