// src/renderer.js
import './styles.css';

window.addEventListener('DOMContentLoaded', () => {
    fetchJiraIssues();
});

async function fetchJiraIssues() {
    const issuesList = document.getElementById('issues-list');
    issuesList.innerHTML = '<p class="message">Loading issues...</p>';

    try {
        const issues = await window.jiraAPI.fetchIssues();
        displayIssues(issues);
    } catch (error) {
        console.error("Error loading issues:", error);
        issuesList.innerHTML = `<p class="message">Error loading issues: ${error.message}</p>`;
    }
}

function getStatusColor(statusCategory) {
    switch (statusCategory.name) {
        case 'To Do': return 'status-gray';
        case 'In Progress': return 'status-blue';
        case 'Done': return 'status-green';
        default: return 'status-gray';
    }
}

function displayIssues(issues) {
    const issuesList = document.getElementById('issues-list');
    issuesList.innerHTML = ''; // Clear loading message

    if (issues.length === 0) {
        issuesList.innerHTML = '<p class="message">No issues found.</p>';
        return;
    }

    issues.forEach(issue => {
        const row = document.createElement('div');
        row.className = 'issue-row';

        const priority = issue.fields.priority;
        const status = issue.fields.status;
        const statusColor = getStatusColor(status.statusCategory);

        row.innerHTML = `
            <div class="issue-details">
                <span class="issue-summary">${issue.fields.summary}</span>
                <span class="issue-key">${issue.key}</span>
            </div>
            <div class="issue-status ${statusColor}">
                ${status.name.toUpperCase()}
            </div>
        `;

        row.addEventListener('click', () => {
            const baseUrl = issue.self.split('/rest/api')[0];
            window.electronAPI.openLink(`${baseUrl}/browse/${issue.key}`);
        });

        issuesList.appendChild(row);
    });
}