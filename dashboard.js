// DIGIPIN Zone Data Structure
const zoneData = {
    zones: ['AB12-34CD', 'XY45-78ZT', 'PQ99-12AA'],
    metrics: {
        'AB12-34CD': {
            orders: { '7days': 145, '30days': 652, '90days': 1891, '1year': 7234 },
            avg_delivery_time: 11.3,
            top_product: 'Electronics',
            fraud_rate: 1.8
        },
        'XY45-78ZT': {
            orders: { '7days': 178, '30days': 738, '90days': 2154, '1year': 8956 },
            avg_delivery_time: 13.2,
            top_product: 'Groceries',
            fraud_rate: 2.5
        },
        'PQ99-12AA': {
            orders: { '7days': 102, '30days': 457, '90days': 1378, '1year': 5432 },
            avg_delivery_time: 14.8,
            top_product: 'Food & Beverage',
            fraud_rate: 2.9
        }
    }
};

// Product-specific data for filtering
const productData = {
    all: { multiplier: 1.0 },
    electronics: { multiplier: 0.35, zones: { 'AB12-34CD': 1.5, 'XY45-78ZT': 0.8, 'PQ99-12AA': 0.6 } },
    groceries: { multiplier: 0.40, zones: { 'AB12-34CD': 0.9, 'XY45-78ZT': 1.6, 'PQ99-12AA': 0.7 } },
    clothing: { multiplier: 0.15, zones: { 'AB12-34CD': 1.1, 'XY45-78ZT': 0.9, 'PQ99-12AA': 0.8 } },
    food: { multiplier: 0.25, zones: { 'AB12-34CD': 0.7, 'XY45-78ZT': 1.0, 'PQ99-12AA': 1.5 } },
    home: { multiplier: 0.10, zones: { 'AB12-34CD': 0.8, 'XY45-78ZT': 0.9, 'PQ99-12AA': 1.0 } }
};

// Chart instances
let ordersChart, deliveryTrendChart, fraudPieChart;

// Map instance and markers
let map;
let mapMarkers = [];

// Zone locations (example coordinates - Mumbai, India areas)
const zoneLocations = {
    'AB12-34CD': { lat: 19.0760, lng: 72.8777, color: '#6366f1' }, // Mumbai Central
    'XY45-78ZT': { lat: 19.1136, lng: 72.8697, color: '#8b5cf6' }, // Andheri
    'PQ99-12AA': { lat: 19.0330, lng: 72.8569, color: '#ec4899' }  // South Mumbai
};

// Initialize Real Map with Leaflet
function initMap() {
    if (!document.getElementById('realMap')) {
        console.error('Map container not found');
        return;
    }

    try {
        // Create map centered on Mumbai
        map = L.map('realMap').setView([19.0760, 72.8777], 12);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Add markers for each zone
        Object.entries(zoneLocations).forEach(([zoneName, location]) => {
            addZoneMarker(zoneName, location);
        });

    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function addZoneMarker(zoneName, location) {
    const zoneMetrics = zoneData.metrics[zoneName];
    
    const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div style="
            width: 30px;
            height: 30px;
            background: ${location.color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(createPopupContent(zoneName, zoneMetrics));
    
    mapMarkers.push({ zone: zoneName, marker: marker });
    
    // Add zone coverage circle
    L.circle([location.lat, location.lng], {
        color: location.color,
        fillColor: location.color,
        fillOpacity: 0.1,
        radius: 2000
    }).addTo(map);
}

// Create popup content for a zone
function createPopupContent(zoneName, zoneMetrics) {
    return `
        <div class="custom-popup">
            <div class="popup-zone-code">${zoneName}</div>
            <div class="popup-stats">
                <div class="popup-stat-item">
                    <span class="popup-stat-label">Orders:</span>
                    <span class="popup-stat-value">${zoneMetrics.orders['30days']}</span>
                </div>
                <div class="popup-stat-item">
                    <span class="popup-stat-label">Avg ETA:</span>
                    <span class="popup-stat-value">${zoneMetrics.avg_delivery_time} min</span>
                </div>
                <div class="popup-stat-item">
                    <span class="popup-stat-label">Top Product:</span>
                    <span class="popup-stat-value">${zoneMetrics.top_product}</span>
                </div>
                <div class="popup-stat-item">
                    <span class="popup-stat-label">Fraud Rate:</span>
                    <span class="popup-stat-value">${zoneMetrics.fraud_rate}%</span>
                </div>
            </div>
        </div>
    `;
}

// Initialize charts
function initCharts() {
    // Orders per Zone Bar Chart
    const ordersCtx = document.getElementById('ordersPerZoneChart').getContext('2d');
    ordersChart = new Chart(ordersCtx, {
        type: 'bar',
        data: {
            labels: zoneData.zones,
            datasets: [{
                label: 'Total Orders',
                data: [],
                backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899'],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return 'Orders: ' + context.parsed.y.toLocaleString();
                        },
                        afterLabel: function(context) {
                            const zone = context.label;
                            const metrics = zoneData.metrics[zone];
                            return [
                                'Avg Time: ' + metrics.avg_delivery_time + ' min',
                                'Top Product: ' + metrics.top_product,
                                'Fraud Rate: ' + metrics.fraud_rate + '%'
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Orders',
                        font: { size: 12, weight: 'bold' }
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'DIGIPIN Zones',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });

    // Average Delivery Time Trend Line Chart
    const trendCtx = document.getElementById('deliveryTimeTrendChart').getContext('2d');
    deliveryTrendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'AB12-34CD',
                    data: [10.8, 11.1, 11.6, 11.3],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'XY45-78ZT',
                    data: [12.8, 13.0, 13.5, 13.2],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'PQ99-12AA',
                    data: [14.2, 14.6, 15.1, 14.8],
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#ec4899',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' minutes';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Delivery Time (minutes)',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time Period',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });

    // Initialize Fraud Pie Chart
    function initFraudChart() {
        const ctx = document.getElementById('fraudPieChart').getContext('2d');
        fraudPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Verified', 'Flagged'],
                datasets: [{
                    data: [2847, 73],
                    backgroundColor: ['#059669', '#dc2626'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Update alerts list
    function updateAlerts() {
        const alertsList = document.getElementById('alertsList');
        const alerts = [
            {
                level: 'high',
                icon: '🚨',
                title: 'Sudden Demand Spike',
                desc: 'Gaming laptops up 67% in Bangalore',
                time: '2 mins ago'
            },
            {
                level: 'medium',
                icon: '⚠️',
                title: 'Inventory Alert',
                desc: 'Low stock warning for beauty products',
                time: '15 mins ago'
            },
            {
                level: 'low',
                icon: '📊',
                title: 'Trend Update',
                desc: 'Eco-friendly products gaining momentum',
                time: '1 hour ago'
            }
        ];

        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.level}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-desc">${alert.desc}</div>
                    <div class="alert-time">${alert.time}</div>
                </div>
            </div>
        `).join('');
    }

    // Initialize all charts and data
    document.addEventListener('DOMContentLoaded', () => {
        initMap();
        initCharts();
        initFraudChart();
        updateAlerts();
        // Update stats
        document.getElementById('verifiedCount').textContent = '2,847';
        document.getElementById('flaggedCount').textContent = '73';
        document.getElementById('avgDeliveryTime').textContent = '13.2 min';
        document.getElementById('onTimeRate').textContent = '94.5%';
    });

    // Refresh all data with random variations
    function refreshAllData() {
        // Add random variance to zone data
        Object.keys(zoneData.metrics).forEach(zone => {
            const variance = 0.1; // 10% variance
            
            Object.keys(zoneData.metrics[zone].orders).forEach(timeKey => {
                const baseValue = zoneData.metrics[zone].orders[timeKey];
                zoneData.metrics[zone].orders[timeKey] = Math.round(
                    baseValue * (1 + (Math.random() - 0.5) * variance * 2)
                );
            });
            
            // Vary delivery time slightly
            const baseTime = [11.3, 13.2, 14.8][zoneData.zones.indexOf(zone)];
            zoneData.metrics[zone].avg_delivery_time = (baseTime + (Math.random() - 0.5) * 1.5).toFixed(1);
            
            // Vary fraud rate
            const baseFraud = [1.8, 2.5, 2.9][zoneData.zones.indexOf(zone)];
            zoneData.metrics[zone].fraud_rate = (baseFraud + (Math.random() - 0.5) * 0.5).toFixed(1);
        });
        
        // Regenerate trend data with slight variations
        deliveryTrendChart.data.datasets.forEach((dataset, index) => {
            dataset.data = dataset.data.map(val => 
                (parseFloat(val) + (Math.random() - 0.5) * 1.0).toFixed(1)
            );
        });
        
        deliveryTrendChart.update();
        
        // Update main dashboard
        updateDashboard();
    }

    // Event listeners for filters
    document.getElementById('productFilter').addEventListener('change', updateDashboard);
    document.getElementById('timeFilter').addEventListener('change', updateDashboard);

    // Refresh Data button
    document.getElementById('refreshDataBtn').addEventListener('click', function() {
        const button = this;
        const icon = button.querySelector('.button-icon');
        
        button.disabled = true;
        icon.style.animation = 'spin 0.5s linear';
        
        setTimeout(() => {
            refreshAllData();
            button.disabled = false;
            icon.style.animation = '';
        }, 500);
    });

    // Generate Insights functionality
    const suggestedActions = [
        { text: 'Increase warehouse stock', class: 'action-stock' },
        { text: 'Optimize delivery route', class: 'action-optimize' },
        { text: 'Review address mapping', class: 'action-review' },
        { text: 'Add more delivery partners', class: 'action-partners' },
        { text: 'Improve packaging process', class: 'action-packaging' },
        { text: 'Enhance fraud detection', class: 'action-fraud' },
        { text: 'Update zone boundaries', class: 'action-boundaries' },
        { text: 'Deploy additional vehicles', class: 'action-vehicles' }
    ];

    document.getElementById('generateInsights').addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="button-icon">⏳</span> Generating...';
        
        // Simulate processing
        setTimeout(() => {
            generateRandomInsights();
            animateMapUpdate();
            button.disabled = false;
            button.innerHTML = '<span class="button-icon">🔄</span> Generate Insights';
        }, 800);
    });

    function generateRandomInsights() {
        const timeFilter = document.getElementById('timeFilter').value;
        const tableBody = document.getElementById('insightsTableBody');
        
        // Generate random data for each zone
        const newData = zoneData.zones.map(zone => {
            const baseOrders = zoneData.metrics[zone].orders[timeFilter];
            const variance = 0.15; // 15% variance
            
            return {
                zone: zone,
                orders: Math.round(baseOrders * (1 + (Math.random() - 0.5) * variance)),
                eta: (zoneData.metrics[zone].avg_delivery_time + (Math.random() - 0.5) * 2).toFixed(1),
                fraud: (zoneData.metrics[zone].fraud_rate + (Math.random() - 0.5) * 0.8).toFixed(1),
                action: suggestedActions[Math.floor(Math.random() * suggestedActions.length)]
            };
        });
        
        // Update table with animation
        tableBody.innerHTML = '';
        newData.forEach((data, index) => {
            setTimeout(() => {
                const row = document.createElement('tr');
                row.style.opacity = '0';
                row.innerHTML = `
                    <td><span class="table-zone-code">${data.zone}</span></td>
                    <td class="data-orders">${data.orders}</td>
                    <td class="data-eta">${data.eta} min</td>
                    <td class="data-fraud">${data.fraud}%</td>
                    <td class="action-cell">
                        <span class="action-badge ${data.action.class}">${data.action.text}</span>
                    </td>
                `;
                tableBody.appendChild(row);
                
                // Fade in animation
                setTimeout(() => {
                    row.style.transition = 'opacity 0.5s';
                    row.style.opacity = '1';
                }, 50);
            }, index * 150);
        });
        
        // Update map markers
        updateMapMarkers(newData);
    }

    function updateMapMarkers(data) {
        data.forEach((zoneData, index) => {
            const mapMarkerObj = mapMarkers.find(m => m.zone === zoneData.zone);
            if (mapMarkerObj) {
                const zoneMetrics = zoneData;
                const location = zoneLocations[zoneData.zone];
                
                // Update popup content
                const popupContent = `
                    <div class="custom-popup">
                        <div class="popup-zone-code">${zoneData.zone}</div>
                        <div class="popup-stats">
                            <div class="popup-stat-item">
                                <span class="popup-stat-label">Orders:</span>
                                <span class="popup-stat-value">${zoneData.orders}</span>
                            </div>
                            <div class="popup-stat-item">
                                <span class="popup-stat-label">Avg ETA:</span>
                                <span class="popup-stat-value">${zoneData.eta} min</span>
                            </div>
                            <div class="popup-stat-item">
                                <span class="popup-stat-label">Fraud Rate:</span>
                                <span class="popup-stat-value">${zoneData.fraud}%</span>
                            </div>
                        </div>
                    </div>
                `;
                
                mapMarkerObj.marker.setPopupContent(popupContent);
                
                // Bounce animation
                mapMarkerObj.marker.openPopup();
                setTimeout(() => {
                    mapMarkerObj.marker.closePopup();
                }, 1500);
            }
        });
    }

    function animateMapUpdate() {
        // Zoom in and out animation
        const currentZoom = map.getZoom();
        map.setZoom(currentZoom + 1);
        setTimeout(() => {
            map.setZoom(currentZoom);
        }, 400);
    }
}

// Update dashboard based on filters
function updateDashboard() {
    const productFilter = document.getElementById('productFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;

    // Calculate filtered data
    let totalOrders = 0;
    let ordersPerZone = [];
    let totalFraudOrders = 0;

    zoneData.zones.forEach(zone => {
        let orders = zoneData.metrics[zone].orders[timeFilter];
        
        // Apply product filter
        if (productFilter !== 'all') {
            const productMult = productData[productFilter].multiplier;
            const zoneMult = productData[productFilter].zones[zone];
            orders = Math.round(orders * productMult * zoneMult);
        }
        
        ordersPerZone.push(orders);
        totalOrders += orders;
        
        const fraudRate = zoneData.metrics[zone].fraud_rate / 100;
        totalFraudOrders += Math.round(orders * fraudRate);
    });

    // Update metric cards
    document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
    
    const avgTime = zoneData.zones.reduce((sum, zone) => 
        sum + zoneData.metrics[zone].avg_delivery_time, 0) / zoneData.zones.length;
    document.getElementById('avgDeliveryTime').textContent = avgTime.toFixed(1) + ' min';
    
    const topProductMap = { all: 'Groceries', electronics: 'Electronics', groceries: 'Groceries', 
                           clothing: 'Clothing', food: 'Food & Beverage', home: 'Home & Garden' };
    document.getElementById('topProduct').textContent = topProductMap[productFilter];
    
    const overallFraudRate = (totalFraudOrders / totalOrders * 100).toFixed(1);
    document.getElementById('fraudRate').textContent = overallFraudRate + '%';

    // Update charts
    ordersChart.data.datasets[0].data = ordersPerZone;
    ordersChart.update();

    const nonFraudOrders = totalOrders - totalFraudOrders;
    fraudPieChart.data.datasets[0].data = [nonFraudOrders, totalFraudOrders];
    fraudPieChart.update();
    
    // Update zone performance details
    updateZoneDetails();
}

// Update zone performance details section
function updateZoneDetails() {
    const timeFilter = document.getElementById('timeFilter').value;
    const productFilter = document.getElementById('productFilter').value;
    
    const detailsHTML = zoneData.zones.map((zone, index) => {
        let orders = zoneData.metrics[zone].orders[timeFilter];
        
        if (productFilter !== 'all') {
            const productMult = productData[productFilter].multiplier;
            const zoneMult = productData[productFilter].zones[zone];
            orders = Math.round(orders * productMult * zoneMult);
        }
        
        return `
            <div class="zone-item" data-zone-index="${index}" data-zone-name="${zone}">
                <span class="zone-code">${zone}</span>
                <span class="zone-stat">${orders} orders • ${zoneData.metrics[zone].avg_delivery_time} min • ${zoneData.metrics[zone].top_product}</span>
            </div>
        `;
    }).join('');
    
    const zoneDetailsContainer = document.querySelector('.zone-details');
    if (zoneDetailsContainer) {
        zoneDetailsContainer.innerHTML = detailsHTML;
        attachZoneHoverListeners();
    }
}

// Attach hover listeners to zone items
function attachZoneHoverListeners() {
    const zoneItems = document.querySelectorAll('.zone-item');
    
    zoneItems.forEach((item) => {
        item.addEventListener('mouseenter', function() {
            const zoneIndex = parseInt(this.dataset.zoneIndex);
            highlightChartBar(zoneIndex, true);
        });
        
        item.addEventListener('mouseleave', function() {
            const zoneIndex = parseInt(this.dataset.zoneIndex);
            highlightChartBar(zoneIndex, false);
        });
    });
}

// Highlight corresponding bar in chart
function highlightChartBar(index, highlight) {
    if (!ordersChart) return;
    
    const colors = ['#14b8a6', '#0891b2', '#ec4899'];
    const highlightColors = ['#2dd4bf', '#06b6d4', '#f472b6'];
    
    if (highlight) {
        // Dim all bars
        ordersChart.data.datasets[0].backgroundColor = colors.map((color, i) => 
            i === index ? highlightColors[i] : color + '80'
        );
        
        // Scale up the highlighted bar
        ordersChart.data.datasets[0].borderWidth = colors.map((_, i) => 
            i === index ? 3 : 0
        );
        ordersChart.data.datasets[0].borderColor = colors.map((color, i) => 
            i === index ? highlightColors[i] : 'transparent'
        );
    } else {
        // Reset all bars
        ordersChart.data.datasets[0].backgroundColor = colors;
        ordersChart.data.datasets[0].borderWidth = 0;
    }
    
    ordersChart.update('none'); // Update without animation for smooth effect
}

// Refresh all data with random variations
function refreshAllData() {
    // Add random variance to zone data
    Object.keys(zoneData.metrics).forEach(zone => {
        const variance = 0.1; // 10% variance
        
        Object.keys(zoneData.metrics[zone].orders).forEach(timeKey => {
            const baseValue = zoneData.metrics[zone].orders[timeKey];
            zoneData.metrics[zone].orders[timeKey] = Math.round(
                baseValue * (1 + (Math.random() - 0.5) * variance * 2)
            );
        });
        
        // Vary delivery time slightly
        const baseTime = [11.3, 13.2, 14.8][zoneData.zones.indexOf(zone)];
        zoneData.metrics[zone].avg_delivery_time = (baseTime + (Math.random() - 0.5) * 1.5).toFixed(1);
        
        // Vary fraud rate
        const baseFraud = [1.8, 2.5, 2.9][zoneData.zones.indexOf(zone)];
        zoneData.metrics[zone].fraud_rate = (baseFraud + (Math.random() - 0.5) * 0.5).toFixed(1);
    });
    
    // Regenerate trend data with slight variations
    deliveryTrendChart.data.datasets.forEach((dataset, index) => {
        dataset.data = dataset.data.map(val => 
            (parseFloat(val) + (Math.random() - 0.5) * 1.0).toFixed(1)
        );
    });
    
    deliveryTrendChart.update();
    
    // Update main dashboard
    updateDashboard();
}

// Event listeners for filters
document.getElementById('productFilter').addEventListener('change', updateDashboard);
document.getElementById('timeFilter').addEventListener('change', updateDashboard);

// Refresh Data button
document.getElementById('refreshDataBtn').addEventListener('click', function() {
    const button = this;
    const icon = button.querySelector('.button-icon');
    
    button.disabled = true;
    icon.style.animation = 'spin 0.5s linear';
    
    setTimeout(() => {
        refreshAllData();
        button.disabled = false;
        icon.style.animation = '';
    }, 500);
});

// Generate Insights functionality
const suggestedActions = [
    { text: 'Increase warehouse stock', class: 'action-stock' },
    { text: 'Optimize delivery route', class: 'action-optimize' },
    { text: 'Review address mapping', class: 'action-review' },
    { text: 'Add more delivery partners', class: 'action-partners' },
    { text: 'Improve packaging process', class: 'action-packaging' },
    { text: 'Enhance fraud detection', class: 'action-fraud' },
    { text: 'Update zone boundaries', class: 'action-boundaries' },
    { text: 'Deploy additional vehicles', class: 'action-vehicles' }
];

document.getElementById('generateInsights').addEventListener('click', function() {
    const button = this;
    button.disabled = true;
    button.innerHTML = '<span class="button-icon">⏳</span> Generating...';
    
    // Simulate processing
    setTimeout(() => {
        generateRandomInsights();
        animateMapUpdate();
        button.disabled = false;
        button.innerHTML = '<span class="button-icon">🔄</span> Generate Insights';
    }, 800);
});

function generateRandomInsights() {
    const timeFilter = document.getElementById('timeFilter').value;
    const tableBody = document.getElementById('insightsTableBody');
    
    // Generate random data for each zone
    const newData = zoneData.zones.map(zone => {
        const baseOrders = zoneData.metrics[zone].orders[timeFilter];
        const variance = 0.15; // 15% variance
        
        return {
            zone: zone,
            orders: Math.round(baseOrders * (1 + (Math.random() - 0.5) * variance)),
            eta: (zoneData.metrics[zone].avg_delivery_time + (Math.random() - 0.5) * 2).toFixed(1),
            fraud: (zoneData.metrics[zone].fraud_rate + (Math.random() - 0.5) * 0.8).toFixed(1),
            action: suggestedActions[Math.floor(Math.random() * suggestedActions.length)]
        };
    });
    
    // Update table with animation
    tableBody.innerHTML = '';
    newData.forEach((data, index) => {
        setTimeout(() => {
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.innerHTML = `
                <td><span class="table-zone-code">${data.zone}</span></td>
                <td class="data-orders">${data.orders}</td>
                <td class="data-eta">${data.eta} min</td>
                <td class="data-fraud">${data.fraud}%</td>
                <td class="action-cell">
                    <span class="action-badge ${data.action.class}">${data.action.text}</span>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Fade in animation
            setTimeout(() => {
                row.style.transition = 'opacity 0.5s';
                row.style.opacity = '1';
            }, 50);
        }, index * 150);
    });
    
    // Update map markers
    updateMapMarkers(newData);
}

function updateMapMarkers(data) {
    data.forEach((zoneData, index) => {
        const mapMarkerObj = mapMarkers.find(m => m.zone === zoneData.zone);
        if (mapMarkerObj) {
            const zoneMetrics = zoneData;
            const location = zoneLocations[zoneData.zone];
            
            // Update popup content
            const popupContent = `
                <div class="custom-popup">
                    <div class="popup-zone-code">${zoneData.zone}</div>
                    <div class="popup-stats">
                        <div class="popup-stat-item">
                            <span class="popup-stat-label">Orders:</span>
                            <span class="popup-stat-value">${zoneData.orders}</span>
                        </div>
                        <div class="popup-stat-item">
                            <span class="popup-stat-label">Avg ETA:</span>
                            <span class="popup-stat-value">${zoneData.eta} min</span>
                        </div>
                        <div class="popup-stat-item">
                            <span class="popup-stat-label">Fraud Rate:</span>
                            <span class="popup-stat-value">${zoneData.fraud}%</span>
                        </div>
                    </div>
                </div>
            `;
            
            mapMarkerObj.marker.setPopupContent(popupContent);
            
            // Bounce animation
            mapMarkerObj.marker.openPopup();
            setTimeout(() => {
                mapMarkerObj.marker.closePopup();
            }, 1500);
        }
    });
}

function animateMapUpdate() {
    // Zoom in and out animation
    const currentZoom = map.getZoom();
    map.setZoom(currentZoom + 1);
    setTimeout(() => {
        map.setZoom(currentZoom);
    }, 400);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initCharts();
    updateDashboard();
});
