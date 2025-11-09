// Dashboard Integration for DIGIPINE Upload System
// This file connects uploaded data with the main dashboard visualizations

class DashboardIntegration {
    constructor() {
        this.uploadedDataCache = null;
        this.isIntegrated = false;
        this.initializeIntegration();
    }

    initializeIntegration() {
        // Listen for upload completion events
        document.addEventListener('dataUploaded', this.handleDataUpload.bind(this));
        
        // Check if we're on the dashboard page
        if (window.location.pathname.includes('dashboard.html')) {
            this.setupDashboardFeatures();
        }

        // Monitor for uploaded data in localStorage
        this.checkForStoredData();
    }

    checkForStoredData() {
        const storedData = localStorage.getItem('digipine_uploaded_data');
        if (storedData) {
            try {
                this.uploadedDataCache = JSON.parse(storedData);
                this.integrateWithDashboard();
            } catch (error) {
                console.error('Error parsing stored data:', error);
            }
        }
    }

    handleDataUpload(event) {
        const uploadedData = event.detail;
        this.uploadedDataCache = uploadedData;
        
        // Store for cross-page persistence
        localStorage.setItem('digipine_uploaded_data', JSON.stringify(uploadedData));
        
        // Integrate with dashboard if on dashboard page
        if (window.location.pathname.includes('dashboard.html')) {
            this.integrateWithDashboard();
        }
    }

    integrateWithDashboard() {
        if (!this.uploadedDataCache) return;

        // Update global market data
        this.updateMarketData();
        
        // Refresh dashboard visualizations
        this.refreshDashboardCharts();
        
        // Update regional map with precise locations
        this.updateRegionalMap();
        
        // Show integration notification
        this.showIntegrationSuccess();
        
        this.isIntegrated = true;
    }

    updateMarketData() {
        if (!window.marketData || !this.uploadedDataCache) return;

        const { processedAnalytics } = this.uploadedDataCache;
        
        // Update category trends with uploaded data
        if (processedAnalytics.categoryBreakdown) {
            Object.entries(processedAnalytics.categoryBreakdown).forEach(([category, count]) => {
                const categoryKey = category.toLowerCase().replace(/[^a-z]/g, '');
                
                // Create new category if it doesn't exist
                if (!window.marketData.categoryTrends[categoryKey]) {
                    window.marketData.categoryTrends[categoryKey] = {
                        current: count,
                        previous: Math.floor(count * 0.8),
                        change: 25
                    };
                } else {
                    // Update existing category
                    const previous = window.marketData.categoryTrends[categoryKey].current;
                    window.marketData.categoryTrends[categoryKey].previous = previous;
                    window.marketData.categoryTrends[categoryKey].current = count;
                    window.marketData.categoryTrends[categoryKey].change = 
                        ((count - previous) / previous * 100).toFixed(1);
                }
            });
        }

        // Update platform distribution
        if (processedAnalytics.platformDistribution) {
            const totalOrders = processedAnalytics.totalRecords;
            Object.entries(processedAnalytics.platformDistribution).forEach(([platform, count]) => {
                const platformKey = platform.toLowerCase().replace(/[^a-z]/g, '');
                const share = (count / totalOrders * 100).toFixed(1);
                
                if (!window.marketData.platformData[platformKey]) {
                    window.marketData.platformData[platformKey] = {
                        name: platform,
                        share: parseFloat(share),
                        growth: Math.random() * 20 + 5,
                        orders: count
                    };
                } else {
                    window.marketData.platformData[platformKey].share = parseFloat(share);
                    window.marketData.platformData[platformKey].orders = count;
                }
            });
        }

        // Update regional data with location analysis
        if (processedAnalytics.locationAnalysis) {
            Object.entries(processedAnalytics.locationAnalysis).forEach(([location, data]) => {
                const locationKey = location.toLowerCase().replace(/[^a-z]/g, '');
                
                if (!window.marketData.regionalData[locationKey]) {
                    window.marketData.regionalData[locationKey] = {
                        name: location,
                        orders: data.orderCount || data,
                        revenue: data.revenue || data * 850, // Estimate revenue
                        growth: data.growth || Math.random() * 30 + 10,
                        coordinates: this.getCoordinatesForLocation(location)
                    };
                } else {
                    window.marketData.regionalData[locationKey].orders = data.orderCount || data;
                    window.marketData.regionalData[locationKey].revenue = data.revenue || data * 850;
                }
            });
        }
    }

    getCoordinatesForLocation(location) {
        // Mumbai area coordinates mapping
        const locationCoordinates = {
            'bandra': [19.0596, 72.8295],
            'andheri': [19.1136, 72.8697],
            'powai': [19.1176, 72.9060],
            'worli': [19.0176, 72.8118],
            'kurla': [19.0728, 72.8826],
            'ghatkopar': [19.0864, 72.9081],
            'malad': [19.1864, 72.8493],
            'borivali': [19.2307, 72.8567],
            'thane': [19.2183, 72.9781],
            'navi mumbai': [19.0330, 73.0297],
            'kalyan': [19.2403, 73.1305],
            'dombivli': [19.2183, 73.0869]
        };

        const locationKey = location.toLowerCase().replace(/[^a-z]/g, '');
        return locationCoordinates[locationKey] || [19.0760, 72.8777]; // Default to Mumbai center
    }

    refreshDashboardCharts() {
        // Trigger refresh of all dashboard charts if functions exist
        if (typeof window.updateCategoryChart === 'function') {
            window.updateCategoryChart();
        }
        
        if (typeof window.updatePlatformChart === 'function') {
            window.updatePlatformChart();
        }
        
        if (typeof window.updateRegionalChart === 'function') {
            window.updateRegionalChart();
        }

        // Force refresh all charts by calling their update methods
        if (window.categoryChart) {
            const categoryData = this.prepareCategoryChartData();
            window.categoryChart.data = categoryData;
            window.categoryChart.update();
        }

        if (window.platformChart) {
            const platformData = this.preparePlatformChartData();
            window.platformChart.data = platformData;
            window.platformChart.update();
        }

        // Update KPI metrics
        this.updateKPIMetrics();
    }

    prepareCategoryChartData() {
        if (!this.uploadedDataCache?.processedAnalytics?.categoryBreakdown) {
            return window.categoryChart.data; // Return existing data if no upload data
        }

        const breakdown = this.uploadedDataCache.processedAnalytics.categoryBreakdown;
        const labels = Object.keys(breakdown);
        const data = Object.values(breakdown);
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        };
    }

    preparePlatformChartData() {
        if (!this.uploadedDataCache?.processedAnalytics?.platformDistribution) {
            return window.platformChart.data; // Return existing data if no upload data
        }

        const distribution = this.uploadedDataCache.processedAnalytics.platformDistribution;
        const totalOrders = this.uploadedDataCache.processedAnalytics.totalRecords;
        
        const labels = Object.keys(distribution);
        const data = Object.values(distribution).map(count => (count / totalOrders * 100).toFixed(1));
        const colors = ['#2563eb', '#7c3aed', '#059669', '#dc2626', '#ea580c'];

        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }

    updateKPIMetrics() {
        if (!this.uploadedDataCache?.processedAnalytics) return;

        const analytics = this.uploadedDataCache.processedAnalytics;
        
        // Update total orders
        const totalOrdersElement = document.querySelector('[data-metric="total-orders"]');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = analytics.totalRecords.toLocaleString();
        }

        // Update revenue (estimated)
        const totalRevenue = analytics.topProducts?.reduce((sum, product) => sum + product.totalRevenue, 0) || 0;
        const revenueElement = document.querySelector('[data-metric="revenue"]');
        if (revenueElement) {
            revenueElement.textContent = `₹${(totalRevenue / 1000).toFixed(1)}K`;
        }

        // Update conversion rate (calculated from valid records)
        const conversionRate = ((analytics.validRecords / analytics.totalRecords) * 100).toFixed(1);
        const conversionElement = document.querySelector('[data-metric="conversion"]');
        if (conversionElement) {
            conversionElement.textContent = `${conversionRate}%`;
        }

        // Update categories count
        const categoriesCount = Object.keys(analytics.categoryBreakdown || {}).length;
        const categoriesElement = document.querySelector('[data-metric="categories"]');
        if (categoriesElement) {
            categoriesElement.textContent = categoriesCount;
        }
    }

    updateRegionalMap() {
        if (!window.map || !this.uploadedDataCache?.processedAnalytics?.locationAnalysis) return;

        // Clear existing markers
        if (window.mapMarkers) {
            window.mapMarkers.forEach(marker => window.map.removeLayer(marker));
            window.mapMarkers = [];
        }

        // Add new markers based on uploaded location data
        const locationAnalysis = this.uploadedDataCache.processedAnalytics.locationAnalysis;
        
        Object.entries(locationAnalysis).forEach(([location, data]) => {
            const coordinates = this.getCoordinatesForLocation(location);
            const orderCount = data.orderCount || data;
            
            // Create marker with size based on order volume
            const markerSize = Math.max(10, Math.min(30, orderCount * 2));
            const color = this.getMarkerColor(orderCount);
            
            const marker = L.circleMarker(coordinates, {
                radius: markerSize,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(window.map);

            // Add popup with location details
            marker.bindPopup(`
                <div class="marker-popup">
                    <h4>${location}</h4>
                    <p><strong>Orders:</strong> ${orderCount}</p>
                    <p><strong>Market Share:</strong> ${((orderCount / this.uploadedDataCache.processedAnalytics.totalRecords) * 100).toFixed(1)}%</p>
                </div>
            `);

            if (!window.mapMarkers) window.mapMarkers = [];
            window.mapMarkers.push(marker);
        });
    }

    getMarkerColor(orderCount) {
        if (orderCount >= 20) return '#dc2626'; // High volume - red
        if (orderCount >= 10) return '#ea580c'; // Medium volume - orange
        if (orderCount >= 5) return '#ca8a04';  // Low-medium volume - yellow
        return '#16a34a'; // Low volume - green
    }

    showIntegrationSuccess() {
        const notification = document.createElement('div');
        notification.className = 'integration-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🚀</div>
                <div class="notification-text">
                    <h4>Data Integration Complete!</h4>
                    <p>Your uploaded data is now live in the dashboard</p>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 10000;
            max-width: 350px;
            animation: slideInRight 0.5s ease;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.5s ease';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, 5000);
    }

    setupDashboardFeatures() {
        // Add data source indicator
        this.addDataSourceIndicator();
        
        // Add refresh button for uploaded data
        this.addRefreshButton();
        
        // Setup real-time data update listeners
        this.setupRealTimeUpdates();
    }

    addDataSourceIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'data-source-indicator';
        indicator.innerHTML = `
            <div class="indicator-content">
                <span class="indicator-icon">📊</span>
                <span class="indicator-text">Live Data: ${this.isIntegrated ? 'Your uploaded data' : 'Sample data'}</span>
                ${this.isIntegrated ? '<span class="indicator-badge">LIVE</span>' : ''}
            </div>
        `;

        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: ${this.isIntegrated ? '#10b981' : '#6b7280'};
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 25px;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        document.body.appendChild(indicator);
    }

    addRefreshButton() {
        if (!this.isIntegrated) return;

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'refresh-data-btn';
        refreshBtn.innerHTML = `
            <span class="refresh-icon">🔄</span>
            <span class="refresh-text">Refresh Data</span>
        `;

        refreshBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 1rem;
            border-radius: 25px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        refreshBtn.addEventListener('click', () => {
            this.refreshDashboardCharts();
            this.showRefreshSuccess();
        });

        refreshBtn.addEventListener('mouseenter', () => {
            refreshBtn.style.transform = 'translateY(-2px)';
            refreshBtn.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
        });

        refreshBtn.addEventListener('mouseleave', () => {
            refreshBtn.style.transform = 'translateY(0)';
            refreshBtn.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
        });

        document.body.appendChild(refreshBtn);
    }

    showRefreshSuccess() {
        const refresh = document.querySelector('.refresh-data-btn .refresh-icon');
        if (refresh) {
            refresh.style.animation = 'spin 1s ease-in-out';
            setTimeout(() => {
                refresh.style.animation = '';
            }, 1000);
        }
    }

    setupRealTimeUpdates() {
        // Listen for storage changes (when data is uploaded from another tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'digipine_uploaded_data' && e.newValue) {
                try {
                    this.uploadedDataCache = JSON.parse(e.newValue);
                    this.integrateWithDashboard();
                } catch (error) {
                    console.error('Error parsing storage data:', error);
                }
            }
        });
    }

    // Public method to manually trigger integration
    triggerIntegration(uploadedData) {
        if (uploadedData) {
            this.uploadedDataCache = uploadedData;
            localStorage.setItem('digipine_uploaded_data', JSON.stringify(uploadedData));
        }
        this.integrateWithDashboard();
    }

    // Public method to clear integrated data
    clearIntegratedData() {
        this.uploadedDataCache = null;
        this.isIntegrated = false;
        localStorage.removeItem('digipine_uploaded_data');
        
        // Remove UI indicators
        const indicator = document.querySelector('.data-source-indicator');
        const refreshBtn = document.querySelector('.refresh-data-btn');
        if (indicator) indicator.remove();
        if (refreshBtn) refreshBtn.remove();
    }
}

// Initialize dashboard integration
window.dashboardIntegration = new DashboardIntegration();

// Add CSS animations
const integrationStyles = document.createElement('style');
integrationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .integration-notification {
        font-family: 'Inter', sans-serif;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .notification-icon {
        font-size: 1.5rem;
    }

    .notification-text h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
    }

    .notification-text p {
        margin: 0;
        font-size: 0.875rem;
        opacity: 0.9;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
        margin-left: auto;
    }

    .notification-close:hover {
        opacity: 1;
    }

    .indicator-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .indicator-badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 0.125rem 0.5rem;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .marker-popup {
        font-family: 'Inter', sans-serif;
    }

    .marker-popup h4 {
        margin: 0 0 0.5rem 0;
        color: #1e293b;
        font-size: 1rem;
    }

    .marker-popup p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
        color: #64748b;
    }
`;
document.head.appendChild(integrationStyles);

// --- Chart.js Analytics Section Initialization ---
document.addEventListener('DOMContentLoaded', function() {
    // Funnel Analysis
    window.funnelChart = new Chart(document.getElementById('funnelChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['View', 'Add to Cart', 'Checkout', 'Payment', 'Purchase'],
            datasets: [{
                label: 'Users',
                data: [1000, 700, 400, 300, 250],
                backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
                borderRadius: 8,
                maxBarThickness: 38
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } }
        }
    });

    // Customer Segmentation
    window.segmentationChart = new Chart(document.getElementById('segmentationChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['New', 'Loyal', 'High-value', 'Churn risk'],
            datasets: [{
                data: [320, 180, 90, 60],
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: { cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });

    // Inventory & Demand Forecasting
    window.forecastChart = new Chart(document.getElementById('forecastChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                { label: 'Current', data: [120, 140, 130, 150, 170, 160, 180], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', tension: 0.4, fill: true },
                { label: 'Predicted', data: [130, 150, 145, 160, 180, 175, 200], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', borderDash: [6,4], tension: 0.4, fill: true }
            ]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });

    // Conversion Rate Optimization (CRO)
    window.croChart = new Chart(document.getElementById('croChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['CTA A', 'CTA B'],
            datasets: [{
                label: 'Conversion Rate',
                data: [3.2, 3.6],
                backgroundColor: ['#6366f1', '#10b981'],
                borderRadius: 8,
                maxBarThickness: 38
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 5 } } }
    });

    // Competitive Analysis
    window.competitiveChart = new Chart(document.getElementById('competitiveChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Your Platform', 'Zepto', 'Blinkit', 'Swiggy'],
            datasets: [{
                label: 'Avg Price (₹)',
                data: [95, 100, 102, 98],
                backgroundColor: ['#6366f1', '#ef4444', '#f59e0b', '#10b981'],
                borderRadius: 8,
                maxBarThickness: 38
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Fraud vs Non-Fraud Deliveries Chart
    if (document.getElementById('fraudPieChart')) {
        new Chart(document.getElementById('fraudPieChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Non-Fraud', 'Fraud'],
                datasets: [{
                    data: [92, 8], // Example: 92% non-fraud, 8% fraud
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { enabled: true }
                }
            }
        });
    }

    // Animate metrics
    animateMetric('totalSales', 0, 125000, 1200, '₹');
    animateMetric('totalOrders', 0, 3200, 1200);
    animateMetric('conversionRate', 0, 3.8, 1200, '', '%');
    animateMetric('activeCustomers', 0, 1120, 1200);
    animateMetric('funnelConversion', 0, 25, 1000, '', '%');
    animateMetric('cartAbandonment', 0, 18, 1000, '', '%');
    animateMetric('returningCustomerRate', 0, 42, 1000, '', '%');
    animateMetric('clv', 0, 3200, 1000, '₹');
    animateMetric('stockoutRisk', 0, 7, 1000, '', '%');
    animateMetric('predictedDemand', 0, 210, 1000);
    animateMetric('croImprovement', 0, 12, 1000, '', '%');
    animateMetric('priceCompetitiveness', 0, 5, 1000, '', '%');
});

function animateMetric(id, start, end, duration, prefix = '', suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = start + (end - start) * progress;
        el.textContent = prefix + (suffix === '%' ? value.toFixed(1) : Math.floor(value)) + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}