// analytics.js - DIGIPINE Analytics Dashboard Logic
// Chart.js & Leaflet.js integration with mock data and KPI animation

document.addEventListener('DOMContentLoaded', function() {
    // --- Mock Data ---
    const mockData = {
        sales: { zepto: 35, blinkit: 28, swiggy: 25, others: 12 },
        customers: { new: 40, repeat: 35, loyal: 20, churn: 5 },
        funnel: [100, 70, 50, 40, 30],
        forecast: [50, 60, 80, 90, 110, 130, 150],
        forecastLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        competition: { yourPrice: [120, 115, 100], competitor: [110, 118, 105], labels: ['Electronics', 'Groceries', 'Fashion'] },
        kpis: { sales: 125000, orders: 3200, conversion: 3.8, active: 1120 },
        cities: [
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777, orders: 820, growth: 12.5 },
            { name: 'Delhi', lat: 28.6139, lng: 77.2090, orders: 670, growth: 10.2 },
            { name: 'Bangalore', lat: 12.9716, lng: 77.5946, orders: 540, growth: 8.7 },
            { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, orders: 410, growth: 7.1 },
            { name: 'Pune', lat: 18.5204, lng: 73.8567, orders: 320, growth: 6.3 }
        ]
    };

    // --- Animate KPI Cards ---
    function animateKPI(id, end, prefix = '', suffix = '', duration = 1200) {
        const el = document.getElementById(id);
        if (!el) return;
        let start = 0;
        let startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const value = start + (end - start) * progress;
            el.textContent = prefix + (suffix === '%' ? value.toFixed(1) : Math.floor(value)) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    animateKPI('kpiSales', mockData.kpis.sales, '₹');
    animateKPI('kpiOrders', mockData.kpis.orders);
    animateKPI('kpiConversion', mockData.kpis.conversion, '', '%');
    animateKPI('kpiCustomers', mockData.kpis.active);

    // --- Platform Performance Chart ---
    if (document.getElementById('platformChart')) {
    new Chart(document.getElementById('platformChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Zepto', 'Blinkit', 'Swiggy', 'Others'],
            datasets: [{
                data: [mockData.sales.zepto, mockData.sales.blinkit, mockData.sales.swiggy, mockData.sales.others],
                backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#e5e7eb'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } },
            cutout: '70%'
        }
    });
    }

    // --- Customer Segmentation Chart ---
    if (document.getElementById('customerSegmentationChart')) {
    new Chart(document.getElementById('customerSegmentationChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['New', 'Repeat', 'Loyal', 'Churn Risk'],
            datasets: [{
                data: [mockData.customers.new, mockData.customers.repeat, mockData.customers.loyal, mockData.customers.churn],
                backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } }
        }
    });
    }

    // --- Funnel Analysis Chart ---
    if (document.getElementById('funnelChart')) {
    new Chart(document.getElementById('funnelChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['View', 'Add to Cart', 'Checkout', 'Payment', 'Purchase'],
            datasets: [{
                label: 'Users',
                data: mockData.funnel,
                backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#9ca3af'],
                borderRadius: 8,
                maxBarThickness: 38
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: { x: { beginAtZero: true } }
        }
    });
    }

    // --- Inventory Forecast Chart ---
    if (document.getElementById('demandChart')) {
    new Chart(document.getElementById('demandChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: mockData.forecastLabels,
            datasets: [
                { label: 'Current', data: mockData.forecast.map(v => v - 10), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true },
                { label: 'Predicted', data: mockData.forecast, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', borderDash: [6,4], tension: 0.4, fill: true }
            ]
        },
        options: {
            plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } }
        }
    });
    }

    // --- Competitive Benchmark Chart ---
    if (document.getElementById('benchmarkChart')) {
    new Chart(document.getElementById('benchmarkChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: mockData.competition.labels,
            datasets: [
                { label: 'Your Avg Price', data: mockData.competition.yourPrice, backgroundColor: '#10b981', borderRadius: 8, maxBarThickness: 38 },
                { label: 'Competitor Avg', data: mockData.competition.competitor, backgroundColor: '#ef4444', borderRadius: 8, maxBarThickness: 38 }
            ]
        },
        options: {
            plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } },
            scales: { y: { beginAtZero: true } }
        }
    });
    }

    // --- Leaflet Map ---
    if (document.getElementById('regionMap')) {
    const map = L.map('regionMap', { center: [20.5937, 78.9629], zoom: 5, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors', maxZoom: 18, minZoom: 4
    }).addTo(map);
    mockData.cities.forEach(city => {
        let color = '#10b981';
        if (city.orders < 400) color = '#ef4444';
        else if (city.orders < 600) color = '#f59e0b';
        const marker = L.circleMarker([city.lat, city.lng], {
            radius: 18,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(map);
        marker.bindTooltip(`<b>${city.name}</b><br>Orders: ${city.orders}<br>Growth: ${city.growth}%`);
    });
    }

    // --- Insight Boxes (one-liners) ---
    // These are static for now, but could be set dynamically if needed
});// DIGIPINE Analytics Dashboard Logic
// Theme: Emerald Green (#10b981), Soft Grey (#e5e7eb), Light BG (#f9fafb), Text (#1f2937)
// Chart.js & Leaflet.js integration, animated KPIs, mock data

const mockData = {
    kpis: {
        sales: 1250000,
        orders: 32000,
        conversion: 3.8,
        customers: 11200
    },
    regions: [
        { name: 'Mumbai', orders: 8200, growth: 12.5, topCategory: 'Electronics', lat: 19.0760, lng: 72.8777 },
        { name: 'Delhi NCR', orders: 6700, growth: 10.2, topCategory: 'Groceries', lat: 28.6139, lng: 77.2090 },
        { name: 'Bangalore', orders: 5400, growth: 8.7, topCategory: 'Fashion', lat: 12.9716, lng: 77.5946 },
        { name: 'Hyderabad', orders: 4100, growth: 7.1, topCategory: 'Beauty', lat: 17.3850, lng: 78.4867 },
        { name: 'Pune', orders: 3200, growth: 6.3, topCategory: 'Home', lat: 18.5204, lng: 73.8567 }
    ],
    platforms: [
        { name: 'Zepto', sales: 420000, share: 34, growth: 12.2 },
        { name: 'Blinkit', sales: 350000, share: 28, growth: 9.8 },
        { name: 'Swiggy IM', sales: 270000, share: 22, growth: 15.1 },
        { name: 'BigBasket', sales: 120000, share: 10, growth: 7.2 },
        { name: 'Others', sales: 90000, share: 6, growth: 4.5 }
    ],
    categories: [
        { name: 'Electronics', sales: 320000 },
        { name: 'Groceries', sales: 270000 },
        { name: 'Fashion', sales: 180000 },
        { name: 'Beauty', sales: 120000 },
        { name: 'Home', sales: 90000 }
    ],
    topProducts: [
        { name: 'iPhone 15 Pro', trend: 'up' },
        { name: 'Organic Bananas', trend: 'up' },
        { name: 'Nike Air Max', trend: 'up' },
        { name: 'Protein Powder', trend: 'up' },
        { name: 'Smart Watch', trend: 'up' },
        { name: 'LED TV', trend: 'down' },
        { name: 'Almonds', trend: 'up' },
        { name: 'Face Serum', trend: 'down' },
        { name: 'Yoga Mat', trend: 'up' },
        { name: 'Dairy Milk', trend: 'down' }
    ],
    customerSegments: [3200, 4200, 2800, 1000], // New, Repeat, Loyal, Churn risk
    returningRate: 62,
    clv: 3200,
    churn: 8.5,
    funnel: [32000, 21000, 12000, 9000, 8200], // View, Add to Cart, Checkout, Payment, Purchase
    dropoff: 35,
    funnelConversion: 25.6,
    demand: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        current: [1200, 1400, 1300, 1500, 1700, 1600, 1800],
        forecast: [1300, 1500, 1450, 1600, 1800, 1750, 2000],
        topCategory: 'Beverages',
        forecastGrowth: 25
    },
    benchmark: {
        labels: ['Your Price', 'Zepto', 'Blinkit', 'Swiggy'],
        data: [95, 100, 87, 98],
        priceAdvantage: -10 // Dairy is 10% costlier than Blinkit
    },
    sentiment: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        positive: [80, 85, 78, 90, 88, 92, 95],
        negative: [20, 15, 22, 10, 12, 8, 5],
        csat: 4.2,
        nps: 38
    }
};

// Animate KPI cards
function animateKPI(id, end, prefix = '', suffix = '', duration = 1200) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    let startTime = null;
    function step(ts) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const value = start + (end - start) * progress;
        el.textContent = prefix + (suffix === '%' ? value.toFixed(1) : Math.floor(value)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// Initialize all KPIs
function initKPIs() {
    animateKPI('kpiSales', mockData.kpis.sales, '₹');
    animateKPI('kpiOrders', mockData.kpis.orders);
    animateKPI('kpiConversion', mockData.kpis.conversion, '', '%');
    animateKPI('kpiCustomers', mockData.kpis.customers);
    animateKPI('marketShare', 34, '', '%');
    animateKPI('platformGrowth', 15.1, '', '%');
    animateKPI('returningRate', mockData.returningRate, '', '%');
    animateKPI('clv', mockData.clv, '₹');
    animateKPI('churn', mockData.churn, '', '%');
    animateKPI('dropoff', mockData.dropoff, '', '%');
    animateKPI('funnelConversion', mockData.funnelConversion, '', '%');
    animateKPI('forecastGrowth', mockData.demand.forecastGrowth, '', '%');
    animateKPI('priceAdvantage', mockData.benchmark.priceAdvantage, '', '%');
    animateKPI('csat', mockData.sentiment.csat);
    animateKPI('nps', mockData.sentiment.nps);
}

// Top Products List
function renderTopProducts() {
    const ul = document.getElementById('topProductsList');
    ul.innerHTML = '';
    mockData.topProducts.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `${p.name} <span class="trend-${p.trend}">${p.trend === 'up' ? '↑' : '↓'}</span>`;
        ul.appendChild(li);
    });
}

// Platform Chart
function renderPlatformChart() {
    new Chart(document.getElementById('platformChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: mockData.platforms.map(p => p.name),
            datasets: [{
                data: mockData.platforms.map(p => p.sales),
                backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#9ca3af', '#e5e7eb'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: { cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });
}

// Category Chart
function renderCategoryChart() {
    new Chart(document.getElementById('categoryChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: mockData.categories.map(c => c.name),
            datasets: [{
                label: 'Sales',
                data: mockData.categories.map(c => c.sales),
                backgroundColor: '#10b981',
                borderRadius: 8,
                maxBarThickness: 38
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

// Customer Segmentation Chart
function renderCustomerSegmentationChart() {
    new Chart(document.getElementById('customerSegmentationChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['New', 'Repeat', 'Loyal', 'Churn risk'],
            datasets: [{
                data: mockData.customerSegments,
                backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: { cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });
}

// Funnel Chart
function renderFunnelChart() {
    new Chart(document.getElementById('funnelChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['View', 'Add to Cart', 'Checkout', 'Payment', 'Purchase'],
            datasets: [{
                label: 'Users',
                data: mockData.funnel,
                backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#9ca3af'],
                borderRadius: 8,
                maxBarThickness: 38
            }]
        },
        options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
    });
}

// Demand Chart
function renderDemandChart() {
    new Chart(document.getElementById('demandChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: mockData.demand.labels,
            datasets: [
                { label: 'Current', data: mockData.demand.current, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true },
                { label: 'Forecast', data: mockData.demand.forecast, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', borderDash: [6,4], tension: 0.4, fill: true }
            ]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
    document.getElementById('topDemandCategory').textContent = mockData.demand.topCategory;
}

// Benchmark Chart
function renderBenchmarkChart() {
    new Chart(document.getElementById('benchmarkChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: mockData.benchmark.labels,
            datasets: [{
                label: 'Avg Price (₹)',
                data: mockData.benchmark.data,
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1'],
                borderRadius: 8,
                maxBarThickness: 38
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

// Sentiment Chart
function renderSentimentChart() {
    new Chart(document.getElementById('sentimentChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: mockData.sentiment.labels,
            datasets: [
                { label: 'Positive', data: mockData.sentiment.positive, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true },
                { label: 'Negative', data: mockData.sentiment.negative, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4, fill: true }
            ]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

// Regional Map
function renderRegionMap() {
    const map = L.map('regionMap', { center: [20.5937, 78.9629], zoom: 5, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors', maxZoom: 18, minZoom: 4
    }).addTo(map);
    mockData.regions.forEach(region => {
        let color = '#10b981';
        if (region.orders < 4000) color = '#ef4444';
        else if (region.orders < 6000) color = '#f59e0b';
        const marker = L.circleMarker([region.lat, region.lng], {
            radius: 18,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(map);
        marker.bindTooltip(`<b>${region.name}</b><br>Orders: ${region.orders}<br>Growth: ${region.growth}%<br>Top: ${region.topCategory}`);
    });
}

// Main Init
window.addEventListener('DOMContentLoaded', () => {
    initKPIs();
    renderTopProducts();
    renderPlatformChart();
    renderCategoryChart();
    renderCustomerSegmentationChart();
    renderFunnelChart();
    renderDemandChart();
    renderBenchmarkChart();
    renderSentimentChart();
    renderRegionMap();
});
