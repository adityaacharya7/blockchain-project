// Initialize Retailer Charts
export function initializeRetailerCharts() {
    // Sales by Category Chart
    const salesCtx = document.getElementById('retailerSalesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Fresh Produce', 'Grains', 'Dairy', 'Spices', 'Others'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    '#FF6B6B',
                    '#4ECDC4',
                    '#45B7D1',
                    '#96CEB4',
                    '#FFEEAD'
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

    // Quality Metrics Chart
    const qualityCtx = document.getElementById('retailerQualityChart').getContext('2d');
    new Chart(qualityCtx, {
        type: 'line',
        data: {
            labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            datasets: [{
                label: 'Quality Score',
                data: [92, 94, 93, 95, 97, 98],
                borderColor: '#FF6B6B',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(255, 107, 107, 0.1)'
            },
            {
                label: 'Verification Rate',
                data: [88, 89, 91, 92, 93, 95],
                borderColor: '#4ECDC4',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(78, 205, 196, 0.1)'
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
                    beginAtZero: false,
                    min: 80,
                    max: 100
                }
            }
        }
    });
}