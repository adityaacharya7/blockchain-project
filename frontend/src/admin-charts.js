// Initialize Admin Dashboard Charts
export function initializeAdminCharts() {
    // Network Performance Chart
    const networkCtx = document.getElementById('networkPerformanceChart').getContext('2d');
    new Chart(networkCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Transaction Speed (ms)',
                data: [150, 145, 160, 155, 140, 145, 150, 160, 170, 180, 190, 185, 175, 165, 155, 150, 145, 140, 135, 130, 140, 145, 150, 155],
                borderColor: '#2D98DA',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(45, 152, 218, 0.1)'
            },
            {
                label: 'Block Time (s)',
                data: [12, 13, 12, 14, 13, 12, 11, 12, 13, 14, 15, 14, 13, 12, 11, 10, 11, 12, 13, 12, 11, 12, 13, 14],
                borderColor: '#954CE9',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(149, 76, 233, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // Node Distribution Chart
    const nodeCtx = document.getElementById('nodeDistributionChart').getContext('2d');
    new Chart(nodeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Validator Nodes', 'Full Nodes', 'Light Nodes'],
            datasets: [{
                data: [12, 24, 36],
                backgroundColor: [
                    '#954CE9',
                    '#2D98DA',
                    '#2ED573'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // User Activity Chart
    const activityCtx = document.getElementById('userActivityChart').getContext('2d');
    new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: ['Farmers', 'Distributors', 'Retailers', 'Consumers'],
            datasets: [{
                label: 'Active Users',
                data: [2847, 456, 1203, 15678],
                backgroundColor: [
                    'rgba(46, 213, 115, 0.8)',
                    'rgba(45, 152, 218, 0.8)',
                    'rgba(255, 107, 107, 0.8)',
                    'rgba(149, 76, 233, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize Event Handlers
export function initializeAdminEvents() {
    // Chart period switcher
    const periodButtons = document.querySelectorAll('.chart-actions button');
    periodButtons.forEach(button => {
        button.addEventListener('click', () => {
            periodButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // TODO: Update chart data based on selected period
        });
    });

    // User filter pills
    const filterPills = document.querySelectorAll('.filter-pills .pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            // TODO: Filter user list based on selected role
        });
    });

    // Settings form submission
    const settingsForm = document.querySelector('.settings-actions .btn--primary');
    if (settingsForm) {
        settingsForm.addEventListener('click', (e) => {
            e.preventDefault();
            // TODO: Save settings
            showToast('success', 'Settings Updated', 'System settings have been updated successfully');
        });
    }
}