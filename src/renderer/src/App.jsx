import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [directoryPath, setDirectoryPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!directoryPath) {
      setMessage('Veuillez sélectionner un dossier de destination');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          directory: directoryPath
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Erreur : ${data.error}`);
      }
    } catch (error) {
      setMessage(`Erreur réseau : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectorySelect = async () => {
    try {
      const folderPath = await window.electronAPI.selectFolder();
      if (folderPath) {
        setDirectoryPath(folderPath);
        console.log('Dossier sélectionné :', folderPath);
      } else {
        console.log('Sélection annulée');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du dossier:', error); 
      setMessage(`Erreur lors de la sélection: ${error.message}`);
    }
  };
  
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.237-2.116-3.313-4.121-2.815zm1.121 5.921h-7v-9.224c.229.265.443.548.621.857l.379-.184v8.551z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SoundCloud to WAV</h1>
          <p className="text-white/80">Téléchargez vos pistes SoundCloud en haute qualité WAV</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="mb-6">
            <label className="block text-white mb-2 text-sm font-medium">URL SoundCloud</label>
            <input
              type="text"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
              placeholder="https://soundcloud.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-white mb-2 text-sm font-medium">Dossier de destination</label>
            <button
              onClick={handleDirectorySelect}
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white hover:bg-white/30 transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {directoryPath ? 'Changer le dossier' : 'Sélectionner un dossier'}
            </button>
            {directoryPath && (
              <p className="mt-2 text-sm text-white/80 truncate">
                <span  role="img" aria-description='folder' >📁</span> {directoryPath}
              </p>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={!url || !directoryPath || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center ${
              !url || !directoryPath || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-white text-orange-600 hover:bg-white/90'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Téléchargement en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger en WAV
              </>
            )}
          </button>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('Erreur') 
                ? 'bg-red-500/20 text-red-100 border border-red-400/30'
                : 'bg-green-500/20 text-green-100 border border-green-400/30'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p><span  role="img" aria-description='sprinkle' >✨</span> Convertissez vos pistes SoundCloud favorites en WAV de haute qualité</p>
        </div>
      </div>
    </div>
  );
}

export default App;