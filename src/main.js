const { app, BrowserWindow, ipcMain, shell } = require('electron');

// --- CONFIGURATION FOR PRIVATE JIRA DEPLOYMENT ---
const JIRA_DOMAIN = "jira url";
const JIRA_PAT = "personal access token";
const JQL_QUERY = "assignee = currentUser() AND status != Resolved";


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

ipcMain.handle('jira:fetchIssues', async () => {
  const encodedQuery = encodeURIComponent(JQL_QUERY);
  // Ensure the URL includes the protocol (http or https)
  const api_url = `https://${JIRA_DOMAIN}/rest/api/latest/search?jql=${encodedQuery}`;
  
  console.log('Fetching URL:', api_url); 

  try {
    const response = await fetch(api_url, {
      method: 'GET',
      headers: {
        // Use Bearer authentication with the PAT
        'Authorization': `Bearer ${JIRA_PAT}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Log the full response to see more details on error
      const errorBody = await response.text();
      console.error('Jira API Error Response:', errorBody);
      throw new Error(`Error from Jira API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues;

  } catch (error) {
    console.error('Failed in main process fetch:', error);
    throw error;
  }
});

ipcMain.on('electron:openLink', (event, url) => {
  // Use the shell module to securely open a link in the user's default browser
  shell.openExternal(url);
});

app.on('ready', createWindow);

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