const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');

let mainWindow;
let pythonProcess = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Fonction pour vérifier et installer les dépendances Python
function checkPythonDependencies() {
  return new Promise((resolve, reject) => {
    console.log('Checking Python dependencies...');
    
    exec('python3 -c "import flask"', (error) => {
      if (error) {
        console.log('Flask not found, installing dependencies...');
        exec('python3 -m pip install flask flask-cors', (installError, stdout, stderr) => {
          if (installError) {
            console.error('Failed to install dependencies:', installError);
            reject(installError);
          } else {
            console.log('Dependencies installed successfully');
            resolve();
          }
        });
      } else {
        console.log('Dependencies are already installed');
        resolve();
      }
    });
  });
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  mainWindow.webContents.openDevTools();


}

function startPythonServer() {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', ['server.py']);
    let serverStarted = false;

    pythonProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log(`Python server: ${message}`);
      
      if (message.includes('Running on') && !serverStarted) {
        serverStarted = true;
        setTimeout(() => {
          resolve(pythonProcess);
        }, 1000); 
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const message = data.toString();
      console.log(`Python server: ${message}`);
      
      // Ces messages sont normaux pour Flask en mode développement
      if (message.includes('WARNING: This is a development server') ||
          message.includes('Restarting with stat') ||
          message.includes('Debugger is active') ||
          message.includes('Debugger PIN')) {
        return; // Ne pas les traiter comme des erreurs
      }
      
      // Si le message contient Running on, c'est normal aussi
      if (message.includes('Running on') && !serverStarted) {
        serverStarted = true;
        setTimeout(() => {
          resolve(pythonProcess);
        }, 1000);
      }
    });

    pythonProcess.on('error', (error) => {
      reject(error);
    });

  });
}

app.whenReady().then(async () => {
  try {
    // Vérifier d'abord les dépendances
    await checkPythonDependencies();
    
    console.log('Starting Python server...');
    await startPythonServer();
    console.log('Python server started successfully');
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox('Erreur', 'Impossible de démarrer le serveur. Vérifiez que Python et les dépendances sont installés.');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0]; 
});