import './settings.css';

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const domainInput = document.getElementById('jira-domain');
    const patInput = document.getElementById('jira-pat');
    const errorMsg = document.getElementById('error-msg');

    saveBtn.addEventListener('click', () => {
        const domain = domainInput.value;
        const pat = patInput.value;

        if (!domain || !pat) {
            errorMsg.textContent = 'Both fields are required.';
            return;
        }

        // Send the credentials to the main process to be saved
        window.electronAPI.saveCredentials({ domain, pat });
    });
    
    cancelBtn.addEventListener('click', () => {
        window.electronAPI.cancelSettings();
    });
});