import { app, BrowserWindow, ipcMain, shell } from 'electron';
import Store from 'electron-store';

const store = new Store();
let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

function createSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  settingsWindow.loadURL(`${MAIN_WINDOW_WEBPACK_ENTRY.replace('main_window', 'settings')}`);
}

app.on('ready', () => {
  if (!store.get('jira_pat')) {
    createSettingsWindow();
  } else {
    createMainWindow();
  }
});

ipcMain.on('save-credentials', (event, { domain, pat }) => {
  store.set('jira_domain', domain);
  store.set('jira_pat', pat);

  const settingsWindow = BrowserWindow.fromWebContents(event.sender);
  settingsWindow.close();
  createMainWindow();
});

ipcMain.handle('jira:fetchIssues', async () => {
  const JIRA_DOMAIN = store.get('jira_domain');
  const JIRA_PAT = store.get('jira_pat');
  const JQL_QUERY = "assignee = currentUser() AND status != Resolved";

  if (!JIRA_DOMAIN || !JIRA_PAT) {
    throw new Error('Credentials not set.');
  }
  const encodedQuery = encodeURIComponent(JQL_QUERY);
  const api_url = `https://${JIRA_DOMAIN}/rest/api/latest/search?jql=${encodedQuery}`;

  try {
    const response = await fetch(api_url, {
      headers: { 'Authorization': `Bearer ${JIRA_PAT}`, 'Accept': 'application/json' },
    });

    // Get the raw text from the response
    const responseText = await response.text();

    if (!response.ok) {
      console.error('Jira API Error Response:', responseText);
      throw new Error(`API Error: ${response.status}`);
    }

    // Try to parse the text as JSON
    try {
      const data = JSON.parse(responseText);
      return data.issues;
    } catch (e) {
      console.error("Failed to parse JSON. API responded with this HTML instead:", responseText);
      throw new Error("Received an invalid response from Jira.");
    }
    
  } catch (error) {
    // This will catch network errors
    console.error('Failed to fetch from Jira:', error);
    throw error;
  }
});

ipcMain.on('electron:openLink', (event, url) => { shell.openExternal(url); });

ipcMain.on('open-settings-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
  createSettingsWindow();
});

ipcMain.on('cancel-settings', (event) => {
  const settingsWindow = BrowserWindow.fromWebContents(event.sender);
  settingsWindow.close();

  // If credentials already exist, it means the user came from the main window.
  // Re-open it. Otherwise, quit the app.
  if (store.get('jira_pat')) {
    createMainWindow();
  } else {
    app.quit();
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) app.on('ready'); });