// Render analysis.html content from sessionStorage keys set by upload_integration.js

function safeGetJSON(key) {
    try {
        const v = sessionStorage.getItem(key);
        return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load data from sessionStorage
    const aiResp = safeGetJSON('analysis_response');
    console.log('Loaded analysis data:', aiResp);

    if (!aiResp) {
        console.error('No analysis data found');
        document.getElementById('ai-summary').textContent = 'Error: No analysis data found';
        return;
    }

    // Only add one download button in the header
    const headerDiv = document.querySelector('.header > div:last-child');
    if (headerDiv) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-primary';
        exportBtn.innerHTML = '📥 Download Report';
        exportBtn.onclick = generatePDFReport;
        headerDiv.appendChild(exportBtn);
    }

    // Populate all sections with data
    const kpis = aiResp.kpis || {};
    populateKPIs(kpis);
    populateInsights(aiResp);
    populateCharts(aiResp.chartsData || {});
    populateMap(aiResp.mapPoints || []);
    populateProducts(aiResp.chartsData?.topProducts || []);
    populateSidebar(aiResp);
});

// Helper functions to populate different sections
function populateKPIs(kpis) {
    const defaultKPIs = {
        totalRevenue: 1285750,
        totalUnits: 11500,
        avgPrice: 112.50,
        marketShare: 12.5,
        ltv: 4500,
        retention: 78,
        cac: 850,
        gmv: 1500000
    };

    const kpiData = { ...defaultKPIs, ...kpis };

    // Existing KPIs
    document.getElementById('kpi-revenue').innerHTML = `
        ₹${kpiData.totalRevenue.toLocaleString()}
        <div class="kpi-benchmark">
            <div class="benchmark-label">Industry Avg</div>
            <div class="benchmark-value positive">+12.5%</div>
        </div>
    `;
    document.getElementById('kpi-orders').innerHTML = `${(kpis.totalUnits || 0).toLocaleString()}<div class="kpi-benchmark">+${((Math.random()*15)+5).toFixed(1)}% MoM</div>`;
    document.getElementById('kpi-aov').innerHTML = `₹${(kpis.avgPrice || 0).toFixed(2)}<div class="kpi-benchmark">Benchmark: ₹${((kpis.avgPrice || 0) * 1.1).toFixed(2)}</div>`;
    document.getElementById('kpi-share').innerHTML = `${(kpis.marketShare || 0).toFixed(1)}%<div class="kpi-benchmark">Target: ${((kpis.marketShare || 0) + 2).toFixed(1)}%</div>`;

    // New KPIs
    document.getElementById('kpi-ltv').innerHTML = `
        ₹${kpiData.ltv.toLocaleString()}
        <div class="kpi-benchmark">
            <div class="benchmark-label">Industry Avg: ₹3,800</div>
            <div class="benchmark-value positive">+18.4%</div>
        </div>
    `;

    document.getElementById('kpi-retention').innerHTML = `
        ${kpiData.retention}%
        <div class="kpi-benchmark">
            <div class="benchmark-label">Industry Avg: 65%</div>
            <div class="benchmark-value positive">+13%</div>
        </div>
    `;

    document.getElementById('kpi-cac').innerHTML = `
        ₹${kpiData.cac.toLocaleString()}
        <div class="kpi-benchmark">
            <div class="benchmark-label">Industry Avg: ₹950</div>
            <div class="benchmark-value positive">-10.5%</div>
        </div>
    `;

    document.getElementById('kpi-gmv').innerHTML = `
        ₹${kpiData.gmv.toLocaleString()}
        <div class="kpi-benchmark">
            <div class="benchmark-label">Target: ₹2M</div>
            <div class="benchmark-value">75% achieved</div>
        </div>
    `;
}

function populateInsights(data) {
    // Set default executive summary
    const defaultSummary = `The platform shows strong performance with 15.2% YoY revenue growth. Electronics category leads growth at 22.1%, while the Beauty segment maintains highest customer satisfaction at 4.8/5. North region contributes 32% of total revenue, with premium segment showing 15% higher conversion rates. Customer acquisition cost has decreased by 10.5% through optimized marketing channels.`;
    
    document.getElementById('ai-summary').textContent = data.insightsText || defaultSummary;

    // Add customer feedback analysis
    populateCustomerFeedback();
    populateCohortAnalysis();

    const defaultInsights = [
        { icon: '📈', text: 'Revenue grew 15.2% MoM, outperforming market average by 3.5%' },
        { icon: '🔥', text: 'Electronics category showing strongest growth at 22.1%' },
        { icon: '📍', text: 'North region leads with 32% revenue contribution' },
        { icon: '⭐', text: 'Customer satisfaction increased to 4.5/5 (+0.3)' },
        { icon: '🚀', text: 'Premium segment conversion rate up by 15%' },
        { icon: '💎', text: 'Customer Lifetime Value increased by ₹750 this quarter' },
        { icon: '🔄', text: 'Retention rate improved 8% through loyalty program' },
        { icon: '💰', text: 'Customer Acquisition Cost reduced by 10.5% MoM' },
        { icon: '📦', text: 'Average order value increased 12% in premium segment' },
        { icon: '🎯', text: 'Marketing ROI improved by 25% through targeted campaigns' }
    ];

    const insightsList = document.getElementById('insights-list');
    
    // Check if insights exist and are in the correct format
    let insights = defaultInsights;
    if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
        // If insights are strings, convert them to objects
        insights = data.insights.map((insight, index) => {
            if (typeof insight === 'string') {
                return {
                    icon: defaultInsights[index % defaultInsights.length].icon,
                    text: insight
                };
            }
            // Ensure the insight has the required properties
            return {
                icon: insight.icon || '📊',
                text: insight.text || insight,
                metric: insight.metric
            };
        });
    }
    
    if (!insightsList) {
        console.error('insights-list element not found');
        return;
    }
    
    insightsList.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <div class="insight-text">${insight.text}</div>
                ${insight.metric ? `<div class="insight-metric">${insight.metric}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function populateCustomerFeedback() {
    // Sentiment Chart
    const ctx = document.getElementById('sentiment-chart');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: ['#10b981', '#6b7280', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Populate feedback topics
    const topics = [
        { topic: 'Delivery Speed', sentiment: 'positive', count: 450 },
        { topic: 'Product Quality', sentiment: 'positive', count: 380 },
        { topic: 'App Experience', sentiment: 'neutral', count: 220 },
        { topic: 'Customer Support', sentiment: 'positive', count: 180 },
        { topic: 'Price', sentiment: 'negative', count: 120 }
    ];

    const topicsHtml = topics.map(topic => `
        <div class="feedback-topic ${topic.sentiment}">
            <div class="topic-header">
                <span class="topic-name">${topic.topic}</span>
                <span class="topic-count">${topic.count}</span>
            </div>
            <div class="sentiment-bar">
                <div class="bar-fill" style="width: ${(topic.count / 500 * 100)}%"></div>
            </div>
        </div>
    `).join('');

    document.getElementById('feedback-topics').innerHTML = topicsHtml;
}

function populateCohortAnalysis() {
    const cohortData = {
        months: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
        cohorts: [
            { name: 'Jan 2023', values: [100, 85, 75, 70, 68, 65] },
            { name: 'Feb 2023', values: [100, 82, 72, 68, 65, 62] },
            { name: 'Mar 2023', values: [100, 88, 78, 73, 70, 68] },
            { name: 'Apr 2023', values: [100, 90, 80, 75, 72, 0] },
            { name: 'May 2023', values: [100, 92, 82, 77, 0, 0] },
            { name: 'Jun 2023', values: [100, 95, 85, 0, 0, 0] }
        ]
    };

    const matrixHtml = `
        <div class="cohort-row cohort-header">
            <div class="cohort-cell">Cohort</div>
            ${cohortData.months.map(month => 
                `<div class="cohort-cell">${month}</div>`
            ).join('')}
        </div>
        ${cohortData.cohorts.map(cohort => `
            <div class="cohort-row">
                <div class="cohort-cell" style="font-weight: 600; text-align: left">${cohort.name}</div>
                ${cohort.values.map(value => `
                    <div class="cohort-cell" style="background-color: rgba(37,99,235,${value/100}); color: ${value > 50 ? 'white' : '#1f2937'}">
                        ${value ? value + '%' : '-'}
                    </div>
                `).join('')}
            </div>
        `).join('')}
    `;

    document.getElementById('cohort-matrix').innerHTML = matrixHtml;

    // Add event listeners for filters
    document.querySelector('.cohort-select').addEventListener('change', (e) => {
        // Update matrix based on selected metric
        // For demo, we'll just show an alert
        alert(`Switching to ${e.target.value} analysis`);
    });
}

function populateCharts(chartData) {
    // Category distribution chart (first - upper position)
    new Chart('category-share-chart', {
        type: 'doughnut',
        data: {
            labels: ['Electronics', 'Fashion', 'Beauty', 'Groceries', 'Home'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: ['#2563eb', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Revenue trend chart (second - middle position)
    new Chart('revenue-trend-chart', {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Revenue',
                data: [320445, 390520, 445320, 520390],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Order volume chart (third - bottom position)
    new Chart('order-volume-chart', {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Orders',
                data: [125, 146, 135, 158, 167, 182, 145],
                backgroundColor: 'rgba(37,99,235,0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function populateMap(mapPoints) {
    const map = L.map('map').setView([20.5937, 78.9629], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Add delivery zones
    const deliveryZones = [
        { center: [28.7041, 77.1025], radius: 50000, performance: 92, name: 'Delhi NCR' },
        { center: [19.0760, 72.8777], radius: 45000, performance: 88, name: 'Mumbai Metro' },
        { center: [12.9716, 77.5946], radius: 40000, performance: 85, name: 'Bangalore Urban' }
    ];

    deliveryZones.forEach(zone => {
        L.circle(zone.center, {
            radius: zone.radius,
            color: getPerformanceColor(zone.performance),
            fillColor: '#60a5fa',
            fillOpacity: 0.2,
            weight: 1
        }).bindPopup(`
            <div class="zone-popup">
                <h4>${zone.name}</h4>
                <div class="zone-metrics">
                    <div>Performance: ${zone.performance}%</div>
                    <div>Avg Delivery: ${20 + Math.floor(Math.random() * 10)}min</div>
                    <div>Active Orders: ${Math.floor(Math.random() * 100 + 50)}</div>
                </div>
            </div>
        `).addTo(map);
    });

    // Add markers for points
    mapPoints.forEach(point => {
        L.circleMarker([point.lat, point.lon], {
            radius: Math.max(6, Math.log(point.value + 1) * 3),
            color: getPerformanceColor(point.value),
            fillOpacity: 0.6
        }).bindPopup(`
            <div class="point-popup">
                <h4>${point.label}</h4>
                <div class="metric-grid">
                    <div class="metric">
                        <span class="label">Revenue</span>
                        <span class="value">₹${point.revenue?.toLocaleString()}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Orders</span>
                        <span class="value">${point.value}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Growth</span>
                        <span class="value ${point.trend === 'up' ? 'positive' : 'negative'}">
                            ${point.trend === 'up' ? '↑' : '↓'} ${Math.abs(Math.random() * 20 + 5).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        `).addTo(map);
    });
}

function getPerformanceColor(value, max = 100) {
    const performance = (value / max) * 100;
    if (performance >= 80) return '#16a34a';
    if (performance >= 60) return '#2563eb';
    if (performance >= 40) return '#f59e0b';
    return '#dc2626';
}

function populateProducts(products) {
    const tableBody = document.querySelector('#products-table tbody');
    tableBody.innerHTML = products.map((prod, idx) => `
        <tr>
            <td>
                <div class="product-cell">
                    <span class="rank">#${idx + 1}</span>
                    <span class="name">${prod.name}</span>
                    <div class="product-badges">
                        ${prod.growth > 15 ? '<span class="badge trending">🔥 Trending</span>' : ''}
                        ${prod.growth > 25 ? '<span class="badge hot">⚡ Hot</span>' : ''}
                        ${prod.stock < prod.reorderPoint ? '<span class="badge warning">⚠️ Low Stock</span>' : ''}
                    </div>
                </div>
            </td>
            <td>
                <div class="revenue-cell">
                    <div class="primary">₹${prod.revenue?.toLocaleString()}</div>
                    <div class="secondary">+${(Math.random() * 15 + 5).toFixed(1)}% MoM</div>
                </div>
            </td>
            <td>
                <div class="units-cell">
                    <div class="primary">${prod.value?.toLocaleString()}</div>
                    <div class="secondary">${Math.floor(Math.random() * 50 + 20)} daily avg</div>
                </div>
            </td>
            <td>
                <div class="growth-cell ${prod.growth >= 0 ? 'positive' : 'negative'}">
                    <div class="primary">${prod.growth >= 0 ? '↑' : '↓'} ${Math.abs(prod.growth || 0).toFixed(1)}%</div>
                    <div class="secondary">vs 5.2% avg</div>
                </div>
            </td>
        </tr>
    `).join('');

    // Add tooltips
    document.querySelectorAll('#products-table tbody tr').forEach((tr, idx) => {
        const prod = products[idx];
        tr.addEventListener('mouseenter', () => {
            const tooltip = document.createElement('div');
            tooltip.className = 'product-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-header">${prod.name}</div>
                <div class="tooltip-content">
                    <div class="tooltip-grid">
                        <div class="tooltip-metric">
                            <div class="label">Market Position</div>
                            <div class="value">#${idx + 1} in Category</div>
                        </div>
                        <div class="tooltip-metric">
                            <div class="label">Stock Level</div>
                            <div class="value">${prod.stock || 0} units</div>
                        </div>
                        <div class="tooltip-metric">
                            <div class="label">Reorder Point</div>
                            <div class="value">${prod.reorderPoint || 0} units</div>
                        </div>
                    </div>
                    <div class="tooltip-trends">
                        <div class="trend-chart">
                            <canvas id="trend-${idx}" width="200" height="50"></canvas>
                        </div>
                    </div>
                </div>
            `;
            tr.appendChild(tooltip);
            
            // Add mini trend chart
            new Chart(document.getElementById(`trend-${idx}`), {
                type: 'line',
                data: {
                    labels: ['W1', 'W2', 'W3', 'W4'],
                    datasets: [{
                        data: [
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100,
                            prod.value
                        ],
                        borderColor: '#2563eb',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { display: false }, y: { display: false } }
                }
            });
        });
        tr.addEventListener('mouseleave', () => {
            const tooltip = tr.querySelector('.product-tooltip');
            if (tooltip) tooltip.remove();
        });
    });
}

function populateSidebar(data) {
    // Hardcoded critical alerts data
    const hardcodedWarnings = [
        {
            text: "Inventory Alert: iPhone 15 Pro (5 units remaining)",
            severity: "high",
            impact: "Potential Revenue Loss: ₹6,45,000",
            icon: "⚠️",
            action: "Reorder Now"
        },
        {
            text: "Sales Drop: Electronics Category (-15% WoW)",
            severity: "high",
            impact: "Weekly Impact: ₹2,35,000",
            icon: "📉",
            action: "View Analysis"
        },
        {
            text: "Competitor Price Alert: Samsung S23",
            severity: "medium",
            impact: "Margin Risk: 12% below market",
            icon: "🔔",
            action: "Adjust Price"
        },
        {
            text: "Customer Satisfaction Drop in Mumbai",
            severity: "medium",
            impact: "CSAT Score: 3.8/5 (-0.4)",
            icon: "😟",
            action: "View Details"
        }
    ];

    // Populate warnings list with hardcoded data
    const warningsList = document.getElementById('warnings-list');
    if (warningsList) {
        warningsList.innerHTML = hardcodedWarnings.map(warning => `
            <div class="warning-item ${warning.severity}">
                <div class="warning-content">
                    <div class="warning-icon">${warning.icon}</div>
                    <div class="warning-details">
                        <div class="warning-text">${warning.text}</div>
                        <div class="warning-impact">${warning.impact}</div>
                    </div>
                </div>
                <div class="warning-actions">
                    <button class="btn-action" onclick="handleWarningAction('${warning.action}')">${warning.action}</button>
                </div>
            </div>
        `).join('');

        // Add click handlers for warning actions
        document.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert('Action triggered: ' + btn.textContent);
            });
        });
    }

    // Populate competitor strategies
    const strategyList = document.getElementById('strategy-list');
    if (strategyList) {
        strategyList.innerHTML = (data.competitorStrategies || []).map(strategy => `
            <div class="strategy-item">
                <div class="strategy-text">${strategy}</div>
            </div>
        `).join('');
    }

    // Populate recommendations
    const recommendationsList = document.getElementById('recommendations-list');
    if (recommendationsList) {
        recommendationsList.innerHTML = (data.recommendations || []).map(rec => `
            <div class="strategy-item">
                <div class="strategy-text">${rec}</div>
                <div class="strategy-metrics">
                    <span class="priority">High Priority</span>
                    <span class="impact">+${(Math.random() * 15 + 5).toFixed(1)}% Impact</span>
                </div>
            </div>
        `).join('');
    }

    // Add market signals if container exists
    const signalsContainer = document.getElementById('market-signals');
    if (signalsContainer) {
        signalsContainer.innerHTML = generateMarketSignals();
    }
}

// Add market signals generator
function generateMarketSignals() {
    const signals = [
        { type: 'price', text: 'Electronics category showing 5% price increase', time: '2m ago', impact: 'high' },
        { type: 'demand', text: 'Surge in Beauty category demand', time: '5m ago', impact: 'medium' },
        { type: 'competitor', text: 'New competitor entry in South region', time: '12m ago', impact: 'high' },
        { type: 'stock', text: 'Low stock alert: Face Serum', time: '15m ago', impact: 'medium' }
    ];

    return signals.map(signal => `
        <div class="signal-item ${signal.impact}">
            <div class="signal-header">
                <span class="signal-type">${signal.type}</span>
                <span class="signal-time">${signal.time}</span>
            </div>
            <div class="signal-text">${signal.text}</div>
        </div>
    `).join('');
}

// Add PDF generation
async function generatePDFReport() {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Generating...';

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        let yOffset = margin;

        // Helper function to check if we need a new page
        function checkNewPage(requiredSpace = 20) {
            if (yOffset + requiredSpace > pageHeight - margin) {
                doc.addPage();
                yOffset = margin;
                return true;
            }
            return false;
        }

        // Title Page
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, pageWidth, 60, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.text('DIGIPINE Analytics Report', margin, 35);
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN', { 
            dateStyle: 'full', 
            timeStyle: 'short' 
        })}`, margin, 50);

        yOffset = 80;

        // Executive Summary Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text('Executive Summary', margin, yOffset);
        yOffset += 10;

        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 8;

        const summary = document.getElementById('ai-summary').textContent;
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        const splitSummary = doc.splitTextToSize(summary, contentWidth);
        splitSummary.forEach(line => {
            checkNewPage();
            doc.text(line, margin, yOffset);
            yOffset += 6;
        });
        yOffset += 10;

// KPIs Section
checkNewPage(80);
doc.setFontSize(18);
doc.setTextColor(0, 0, 0);
doc.text('Key Performance Indicators', margin, yOffset);
yOffset += 10;
doc.line(margin, yOffset, pageWidth - margin, yOffset);
yOffset += 12;

const kpiElements = document.querySelectorAll('.kpi-card');
const kpiData = [];
kpiElements.forEach(kpi => {
    const label = kpi.querySelector('.kpi-label').textContent;
    const valueElement = kpi.querySelector('.kpi-value');
    // Extract only the main value, remove any child divs content
    let value = valueElement.childNodes[0].textContent.trim();
    kpiData.push({ label, value });
});

// Display KPIs in 2 columns with better spacing
const colWidth = (contentWidth - 10) / 2;
for (let i = 0; i < kpiData.length; i += 2) {
    checkNewPage(30);
    
    // Left column
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yOffset, colWidth, 22, 3, 3, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yOffset, colWidth, 22, 3, 3, 'S');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(kpiData[i].label, margin + 5, yOffset + 8);
    
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.setFont(undefined, 'bold');
    doc.text(kpiData[i].value, margin + 5, yOffset + 17);
    doc.setFont(undefined, 'normal');

    // Right column (if exists)
    if (i + 1 < kpiData.length) {
        const rightX = margin + colWidth + 10;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(rightX, yOffset, colWidth, 22, 3, 3, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.roundedRect(rightX, yOffset, colWidth, 22, 3, 3, 'S');
        
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(kpiData[i + 1].label, rightX + 5, yOffset + 8);
        
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235);
        doc.setFont(undefined, 'bold');
        doc.text(kpiData[i + 1].value, rightX + 5, yOffset + 17);
        doc.setFont(undefined, 'normal');
    }
    
    yOffset += 30;
}

yOffset += 5;

        // Charts Section
        doc.addPage();
        yOffset = margin;
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('Performance Analysis', margin, yOffset);
        yOffset += 10;
        doc.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 15;

        const charts = [
            { id: 'category-share-chart', title: 'Category Distribution' },
            { id: 'revenue-trend-chart', title: 'Revenue Trends' },
            { id: 'order-volume-chart', title: 'Order Volume' }
        ];

        for (const chart of charts) {
            const canvas = document.getElementById(chart.id);
            if (canvas) {
                checkNewPage(100);
                
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(chart.title, margin, yOffset);
                yOffset += 8;
                
                const imgData = canvas.toDataURL('image/png', 1.0);
                const imgWidth = contentWidth;
                const imgHeight = 70;
                
                doc.setDrawColor(229, 231, 235);
                doc.setLineWidth(0.5);
                doc.rect(margin, yOffset, imgWidth, imgHeight);
                doc.addImage(imgData, 'PNG', margin + 2, yOffset + 2, imgWidth - 4, imgHeight - 4);
                yOffset += imgHeight + 15;
            }
        }

        // Insights Section
        doc.addPage();
        yOffset = margin;
        doc.setFontSize(18);
        doc.text('Key Insights & Recommendations', margin, yOffset);
        yOffset += 10;
        doc.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 10;

        const insights = document.querySelectorAll('.insight-item');
        insights.forEach((insight, idx) => {
            checkNewPage(20);
            
            const icon = insight.querySelector('.insight-icon')?.textContent || '•';
            const text = insight.querySelector('.insight-text')?.textContent || 
                        insight.textContent.trim();
            
            doc.setFillColor(240, 249, 255);
            const textHeight = Math.ceil(doc.getTextDimensions(text, { maxWidth: contentWidth - 20 }).h) + 10;
            doc.roundedRect(margin, yOffset, contentWidth, textHeight, 2, 2, 'F');
            
            doc.setFontSize(14);
            doc.text(icon, margin + 5, yOffset + 8);
            
            doc.setFontSize(10);
            doc.setTextColor(31, 41, 55);
            const splitText = doc.splitTextToSize(text, contentWidth - 25);
            doc.text(splitText, margin + 15, yOffset + 8);
            
            yOffset += textHeight + 5;
        });

        // Warnings Section
        const warnings = document.querySelectorAll('.warning-item');
        if (warnings.length > 0) {
            checkNewPage(30);
            yOffset += 10;
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text('Critical Alerts', margin, yOffset);
            yOffset += 10;
            doc.line(margin, yOffset, pageWidth - margin, yOffset);
            yOffset += 10;

            warnings.forEach(warning => {
                checkNewPage(25);
                
                const text = warning.querySelector('.warning-text')?.textContent || '';
                const impact = warning.querySelector('.warning-impact')?.textContent || '';
                
                doc.setFillColor(254, 242, 242);
                doc.roundedRect(margin, yOffset, contentWidth, 22, 2, 2, 'F');
                doc.setDrawColor(220, 38, 38);
                doc.setLineWidth(2);
                doc.line(margin, yOffset, margin, yOffset + 22);
                
                doc.setFontSize(11);
                doc.setTextColor(31, 41, 55);
                doc.text(text, margin + 8, yOffset + 8);
                
                doc.setFontSize(9);
                doc.setTextColor(220, 38, 38);
                doc.text(impact, margin + 8, yOffset + 16);
                
                yOffset += 27;
            });
        }

        // Footer on all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(156, 163, 175);
            doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 10);
            doc.text('DIGIPINE Analytics © 2024', pageWidth - margin - 50, pageHeight - 10);
        }

        // Save the PDF
        const timestamp = new Date().toISOString().split('T')[0];
        doc.save(`DIGIPINE-Analytics-Report-${timestamp}.pdf`);

        alert('✅ PDF report downloaded successfully!');

    } catch (err) {
        console.error('PDF generation failed:', err);
        alert('❌ Failed to generate PDF report. Please try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = '📥 Download Report';
    }
}
// Helper function to render heatmap
function renderHeatmap(data) {
    return `
        <div class="heatmap-table">
            <div class="heatmap-header">
                ${data.metrics.map(m => `<div class="heatmap-cell">${m}</div>`).join('')}
            </div>
            ${data.regions.map((region, i) => `
                <div class="heatmap-row">
                    <div class="heatmap-region">${region}</div>
                    ${data.values[i].map(v => `
                        <div class="heatmap-cell" style="background-color: rgba(37,99,235,${v})">
                            ${(v * 100).toFixed(0)}%
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

// Add new styles
document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
        .signal-item {
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 0.75rem;
            background: #f8fafc;
            border-left: 3px solid;
        }
        .signal-item.high { border-color: #dc2626; }
        .signal-item.medium { border-color: #f59e0b; }
        .signal-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.25rem;
            font-size: 0.75rem;
            color: #64748b;
        }
        .signal-type { text-transform: uppercase; font-weight: 500; }
        .signal-text { font-size: 0.875rem; color: #0f172a; }
        .pulse {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #16a34a;
            position: relative;
        }
        .pulse::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: inherit;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
        }
        .metric-box {
            padding: 1rem;
            background: #f8fafc;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        }
        .metric-box h4 {
            font-size: 0.875rem;
            color: #64748b;
            margin: 0 0 0.5rem 0;
        }
        .metric-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: #0f172a;
        }
        .metric-trend {
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .metric-trend.positive { color: #16a34a; }
        .competitor-grid {
            display: grid;
            gap: 0.5rem;
            margin: 1rem 0;
        }
        .matrix-header {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            font-weight: 500;
            padding: 0.75rem;
            background: #f8fafc;
            border-radius: 0.5rem;
        }
        .matrix-row {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            padding: 0.75rem;
            border-radius: 0.5rem;
            align-items: center;
        }
        .matrix-row.highlight {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
        }
        .trend-item {
            background: #fff;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            border: 1px solid #e5e7eb;
        }
        .trend-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        .trend-type {
            font-weight: 500;
            color: #2563eb;
        }
        .trend-confidence {
            font-size: 0.875rem;
            color: #059669;
        }
        .product-tooltip {
            position: absolute;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            padding: 1rem;
            z-index: 1000;
            min-width: 200px;
            border: 1px solid #e5e7eb;
            transform: translateY(-100%);
        }
        .tooltip-header {
            font-weight: 500;
            margin-bottom: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        .tooltip-content {
            font-size: 0.875rem;
            color: #64748b;
        }
        .predictions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
        .prediction-card { padding: 1rem; background: #f8fafc; border-radius: 0.5rem; }
        .prediction-value { font-size: 1.5rem; font-weight: 600; color: var(--primary); margin: 0.5rem 0; }
        .confidence-bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
        .confidence-bar::after { content: ''; display: block; height: 100%; width: var(--confidence); background: var(--success); }
        
        .heatmap-grid { margin-top: 1rem; overflow-x: auto; }
        .heatmap-table { display: table; width: 100%; border-spacing: 2px; }
        .heatmap-header, .heatmap-row { display: table-row; }
        .heatmap-cell { display: table-cell; padding: 0.75rem; text-align: center; color: white; font-weight: 500; }
        .heatmap-region { display: table-cell; padding: 0.75rem; font-weight: 500; }
        
        .product-cell { display: flex; align-items: center; gap: 0.5rem; }
        .rank { color: #64748b; font-weight: 500; }
        .trending { font-size: 1.2rem; }
        .growth-cell { display: flex; flex-direction: column; }
        .benchmark { font-size: 0.75rem; color: #64748b; }
        
        .date-selector { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
        .date-header { display: flex; justify-content: space-between; align-items: center; }
        .date-presets { display: flex; gap: 0.5rem; }
        .date-preset { padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; cursor: pointer; }
        .date-preset.active { background: var(--primary); color: white; border-color: var(--primary); }
        
        .ai-insights-panel { background: linear-gradient(to right, #f8fafc, #fff); }
        .ai-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .ai-confidence { font-size: 0.875rem; color: var(--success); }
        .insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .ai-insight-card { padding: 1rem; border-radius: 0.5rem; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        
        .benchmarks-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .benchmark-card { padding: 1rem; background: #f8fafc; border-radius: 0.5rem; }
        .benchmark-metric { font-size: 0.875rem; color: #64748b; }
        .benchmark-value { font-size: 1.25rem; font-weight: 600; margin: 0.25rem 0; }
        .benchmark-comparison { font-size: 0.75rem; }
        .benchmark-comparison.above { color: var(--success); }
        .benchmark-comparison.below { color: var(--danger); }
    `
}));

function renderEnhancedAnalysis(aiResp) {
    // Render KPIs with benchmarks
    const kpis = aiResp.kpis || {};
    document.getElementById('kpi-revenue').innerHTML = `
        ₹${(kpis.totalRevenue || 0).toLocaleString()}
        <div class="kpi-benchmark">
            <div class="benchmark-label">Industry Avg</div>
            <div class="benchmark-value positive">+12.5%</div>
            <div class="trend">↑ 15.2% YoY</div>
        </div>
    `;
    
    // Add detailed tooltips to map markers
    (aiResp.mapPoints || []).forEach(point => {
        const marker = L.circleMarker([point.lat, point.lon], {
            radius: Math.max(6, Math.log(point.value + 1) * 3),
            color: getPerformanceColor(point.value, point.revenue),
            fillOpacity: 0.6
        }).bindPopup(`
            <div class="map-popup">
                <h4>${point.label}</h4>
                <div class="popup-metrics">
                    <div class="metric">
                        <div class="metric-label">Revenue</div>
                        <div class="metric-value">₹${point.revenue.toLocaleString()}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Units</div>
                        <div class="metric-value">${point.value}</div>
                    </div>
                </div>
                <div class="popup-categories">
                    ${point.categories.map(c => `<span class="category-tag">${c}</span>`).join('')}
                </div>
            </div>
        `);
    });

    // Enhanced products table with inventory status
    const tableBody = document.querySelector('#products-table tbody');
    tableBody.innerHTML = '';
    (aiResp.chartsData.topProducts || []).forEach((prod, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="product-cell">
                    <span class="rank">#${idx + 1}</span>
                    <span class="name">${prod.name}</span>
                    <div class="product-badges">
                        ${prod.growth > 15 ? '<span class="badge trending">🔥</span>' : ''}
                        ${prod.growth > 25 ? '<span class="badge hot">⚡</span>' : ''}
                        ${prod.stock < prod.reorderPoint ? '<span class="badge warning">⚠️</span>' : ''}
                    </div>
                </div>
            </td>
            <td>₹${prod.revenue.toLocaleString()}</td>
            <td>${prod.value.toLocaleString()}</td>
            <td>
                <div class="growth-cell ${prod.growth >= 0 ? 'positive' : 'negative'}">
                    ${prod.growth >= 0 ? '↑' : '↓'} ${Math.abs(prod.growth).toFixed(1)}%
                    <span class="benchmark">vs 5.2% avg</span>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    // Add other enhanced visualizations...
}

// Enhanced PDF generation
async function generatePDFReport() {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Generating...';

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let yOffset = 20;

        // Title and Header
        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235);
        doc.text('DIGIPINE Analytics Report', 20, yOffset);
        yOffset += 15;

        // Timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yOffset);
        yOffset += 20;

        // Executive Summary
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Executive Summary', 20, yOffset);
        yOffset += 10;

        const summary = document.getElementById('ai-summary').textContent;
        doc.setFontSize(11);
        const splitSummary = doc.splitTextToSize(summary, 170);
        splitSummary.forEach(line => {
            doc.text(line, 20, yOffset);
            yOffset += 7;
        });
        yOffset += 15;

        // KPIs Section
        doc.setFontSize(16);
        doc.text('Key Performance Metrics', 20, yOffset);
        yOffset += 10;

        const kpiElements = document.querySelectorAll('.kpi-card');
        kpiElements.forEach(kpi => {
            const label = kpi.querySelector('.kpi-label').textContent;
            const value = kpi.querySelector('.kpi-value').textContent;
            doc.setFontSize(12);
            doc.text(`• ${label}: ${value}`, 25, yOffset);
            yOffset += 8;
        });
        yOffset += 15;

        // Charts Section
        doc.addPage();
        yOffset = 20;
        doc.setFontSize(16);
        doc.text('Performance Analysis', 20, yOffset);
        yOffset += 15;

        const charts = [
            { id: 'category-share-chart', title: 'Category Distribution' },
            { id: 'revenue-trend-chart', title: 'Revenue Trends' },
            { id: 'order-volume-chart', title: 'Order Volume' }
        ];

        for (const chart of charts) {
            const canvas = document.getElementById(chart.id);
            if (canvas) {
                if (yOffset > 200) {
                    doc.addPage();
                    yOffset = 20;
                }
                doc.setFontSize(14);
                doc.text(chart.title, 20, yOffset);
                yOffset += 10;
                
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 20, yOffset, 170, 80);
                yOffset += 90;
            }
        }

        // Insights and Recommendations
        if (yOffset > 200) {
            doc.addPage();
            yOffset = 20;
        }

        doc.setFontSize(16);
        doc.text('Key Insights & Recommendations', 20, yOffset);
        yOffset += 10;

        const insights = document.querySelectorAll('.insight-item');
        insights.forEach(insight => {
            if (yOffset > 250) {
                doc.addPage();
                yOffset = 20;
            }
            const text = insight.querySelector('.insight-text').textContent;
            doc.setFontSize(11);
            doc.text(`• ${text}`, 25, yOffset);
            yOffset += 8;
        });

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
            doc.text('DIGIPINE Analytics', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
        }

        // Save the PDF
        doc.save(`digipine-analysis-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
        console.error('PDF generation failed:', err);
        alert('Failed to generate PDF report. Please try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = '📥 Download Report';
    }
}

// Add new styles for enhanced warnings
const warningStyles = `
    .warning-item {
        background: white;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 0.75rem;
        border-left: 4px solid transparent;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: transform 0.2s;
    }
    .warning-item:hover {
        transform: translateX(4px);
    }
    .warning-item.high {
        border-color: var(--danger);
    }
    .warning-item.medium {
        border-color: var(--warning);
    }
    .warning-content {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }
    .warning-icon {
        font-size: 1.25rem;
    }
    .warning-details {
        flex: 1;
    }
    .warning-text {
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 0.25rem;
    }
    .warning-impact {
        font-size: 0.875rem;
        color: var(--danger);
    }
    .warning-actions {
        display: flex;
        justify-content: flex-end;
    }
    .btn-action {
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        border: 1px solid #e5e7eb;
        background: transparent;
        font-size: 0.875rem;
        color: var(--primary);
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-action:hover {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
    }
`;

document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: warningStyles
}));
