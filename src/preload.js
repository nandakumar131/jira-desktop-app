// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to the renderer process
contextBridge.exposeInMainWorld('jiraAPI', {
  // The renderer can call this function: window.jiraAPI.fetchIssues()
  fetchIssues: () => ipcRenderer.invoke('jira:fetchIssues')
});

// Expose a secure API for general Electron functions
contextBridge.exposeInMainWorld('electronAPI', {
  openLink: (url) => ipcRenderer.send('electron:openLink', url)
});