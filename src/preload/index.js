import { contextBridge, ipcRenderer } from 'electron'

  try {
  
    contextBridge.exposeInMainWorld('electronAPI', {
      selectFolder: () => ipcRenderer.invoke('select-folder')
    });
    
  } catch (error) {
    console.error(error)
  }
