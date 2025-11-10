// Upload Integration JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeUploadPage();
});

function initializeUploadPage() {
    setupMethodButtons();
    setupFileUpload();
    setupTabs();
    setupSampleData();
    setupPresetCSVs(); // new: wire preset dataset buttons
}

// Embedded small CSV presets (short illustrative datasets)
// NOTE: removed stray '+' characters so PapaParse reads clean CSV and added coordinates where relevant.
const PRESET_CSVS = {
    ecommerce: `product,category,quantity_sold,price,date,region,lat,lon,competitor_price,market_share,growth_rate,delivery_time,customer_rating,stock_level,reorder_point,competitor_name,trend_direction
Wireless Headphones,Electronics,120,59.99,2025-09-01,North,28.7041,77.1025,54.99,12.5,15.2,25,4.5,45,30,CompetitorA,up
Smart Watch,Electronics,85,129.99,2025-09-01,North,28.7041,77.1025,119.99,8.7,22.1,22,4.7,28,25,CompetitorB,up
Organic Almonds,Groceries,200,12.50,2025-09-01,West,19.0760,72.8777,11.99,8.2,9.5,18,4.2,15,120,CompetitorC,down
Premium Coffee,Groceries,175,24.99,2025-09-01,West,19.0760,72.8777,22.99,7.5,12.8,20,4.4,85,70,CompetitorA,up
Running Shoes,Fashion,90,79.99,2025-09-01,South,12.9716,77.5946,74.99,6.8,-2.3,30,4.1,55,40,CompetitorB,down`
};

function setupMethodButtons() {
    // Show file upload section
    document.getElementById('showFileUpload').addEventListener('click', function() {
        document.getElementById('fileUploadSection').style.display = 'block';
        document.getElementById('fileUploadSection').scrollIntoView({ behavior: 'smooth' });
    });

    // API Integration setup
    document.querySelector('.method-button.primary').addEventListener('click', function() {
        showAPIIntegrationModal();
    });

    // Contact sales
    document.querySelectorAll('.method-button.secondary').forEach(button => {
        if (button.textContent.includes('Contact')) {
            button.addEventListener('click', function() {
                showContactModal();
            });
        }
    });
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const processButton = document.getElementById('processData');
    const cancelButton = document.getElementById('cancelUpload');

    // Drag and drop functionality
    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFileSelection(files);
    });

    fileInput.addEventListener('change', function(e) {
        handleFileSelection(e.target.files);
    });

    processButton.addEventListener('click', processUploadedData);
    cancelButton.addEventListener('click', resetUpload);

    // Upload more data button
    const uploadMoreBtn = document.getElementById('uploadMoreData');
    if (uploadMoreBtn) {
        uploadMoreBtn.addEventListener('click', function() {
            resetUpload();
            document.getElementById('fileUploadSection').style.display = 'block';
        });
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.upload-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateUploadContext(this.dataset.tab);
        });
    });
}

function setupSampleData() {
    const sampleButtons = document.querySelectorAll('.sample-button');
    sampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sampleType = this.dataset.sample;
            loadSampleData(sampleType);
        });
    });
}

function setupPresetCSVs() {
    // Use delegated click handling so buttons work even if DOM moves or section is hidden.
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.preset-csv');
        if (!btn) return;

        // Ensure upload section is visible for feedback (users may not have clicked "Upload Files")
        const uploadSection = document.getElementById('fileUploadSection');
        if (uploadSection && uploadSection.style.display === 'none') {
            uploadSection.style.display = 'block';
            uploadSection.scrollIntoView({ behavior: 'smooth' });
            // small delay so the UI becomes visible before heavy work
            setTimeout(() => loadPresetCSV(btn.dataset.preset), 200);
        } else {
            loadPresetCSV(btn.dataset.preset);
        }
    });
}

function handleFileSelection(files) {
    if (files.length === 0) return;

    const uploadArea = document.getElementById('uploadArea');
    const dataMapping = document.getElementById('dataMapping');
    const processButton = document.getElementById('processData');

    // Update UI to show file selected
    uploadArea.innerHTML = `
        <div class="upload-visual">
            <div class="upload-icon">📄</div>
            <div class="upload-animation" style="display: block;">
                <div class="upload-progress"></div>
            </div>
        </div>
        <div class="upload-text">
            <p><strong>${files.length} file(s) selected</strong></p>
            <p class="upload-formats">${Array.from(files).map(f => f.name).join(', ')}</p>
        </div>
    `;

    // Show data mapping section
    dataMapping.style.display = 'block';
    processButton.disabled = false;

    // Simulate file analysis
    setTimeout(() => {
        populateDataMappingOptions(files[0]);
    }, 1000);
}

function populateDataMappingOptions(file) {
    // Simulate CSV column detection
    const sampleColumns = ['product_name', 'quantity_sold', 'price', 'date_sold', 'category', 'region'];
    const selects = document.querySelectorAll('.mapping-select');
    
    selects.forEach(select => {
        // Clear existing options except first
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Add detected columns
        sampleColumns.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            option.textContent = column;
            select.appendChild(option);
        });
    });

    // Auto-map obvious matches
    autoMapColumns();
}

function autoMapColumns() {
    const mappings = {
        'Product Name': ['product_name', 'product', 'item'],
        'Sales Volume': ['quantity_sold', 'quantity', 'volume'],
        'Price': ['price', 'amount', 'cost'],
        'Date': ['date_sold', 'date', 'timestamp']
    };

    document.querySelectorAll('.mapping-item').forEach(item => {
        const label = item.querySelector('label').textContent;
        const select = item.querySelector('.mapping-select');
        
        if (mappings[label]) {
            const columns = Array.from(select.options).map(opt => opt.value);
            const match = mappings[label].find(mapping => columns.includes(mapping));
            if (match) {
                select.value = match;
            }
        }
    });
}

function updateUploadContext(tabType) {
    const contextMappings = {
        sales: {
            title: 'Upload Sales Data',
            description: 'Upload your sales transactions and revenue data',
            fields: ['Product Name', 'Sales Volume', 'Revenue', 'Date']
        },
        inventory: {
            title: 'Upload Inventory Data',
            description: 'Upload stock levels and inventory movement data',
            fields: ['Product Name', 'Stock Level', 'Location', 'Date']
        },
        performance: {
            title: 'Upload Performance Data',
            description: 'Upload KPIs and performance metrics',
            fields: ['Metric Name', 'Value', 'Target', 'Date']
        }
    };

    const context = contextMappings[tabType];
    document.querySelector('.upload-header-content h2').textContent = context.title;
    document.querySelector('.upload-header-content p').textContent = context.description;
}

function processUploadedData() {
    const processButton = document.getElementById('processData');
    const uploadResults = document.getElementById('uploadResults');

    // Show processing state
    processButton.innerHTML = '⏳ Processing...';
    processButton.disabled = true;

    // Get selected file
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files && fileInput.files[0];

    // Collect user mapping (if present)
    const mapping = {};
    document.querySelectorAll('.mapping-item').forEach(item => {
        const key = item.querySelector('label')?.textContent?.trim();
        const val = item.querySelector('.mapping-select')?.value || '';
        if (key) mapping[key] = val;
    });

    if (!file) {
        // fallback to UI-only flow
        setTimeout(() => {
            // keep previous behavior but now redirect to analysis page with simulated data
            const simulatedSummary = { rowCount: 1847, numericColumns: ['quantity_sold','price'], topProducts: [['Electronics', 45]], rowSample: [] };
            const simulatedResponse = {
                insightsText: 'Simulated: Data processed.',
                recommendations: ['Review top categories', 'Check low inventory items'],
                explanations: 'Simulated explanations'
            };
            sessionStorage.setItem('analysis_response', JSON.stringify(simulatedResponse));
            sessionStorage.setItem('analysis_summary', JSON.stringify(simulatedSummary));
            sessionStorage.setItem('analysis_sample', JSON.stringify([]));
            window.location.href = 'analysis.html';
        }, 1000);
        return;
    }

    // Parse CSV (PapaParse is loaded in page). For non-CSV, send minimal sample metadata.
    if (file.name.toLowerCase().endsWith('.csv')) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: false,
            preview: 5000,
            complete: function(results) {
                const rows = results.data || [];
                const sample = rows.slice(0, 100); // sample rows to send to AI
                const summary = buildSummary(rows, mapping);
                // send to backend AI endpoint
                sendToAI({ sample, summary, mapping })
                    .then(aiResp => {
                        sessionStorage.setItem('analysis_response', JSON.stringify(aiResp));
                        sessionStorage.setItem('analysis_summary', JSON.stringify(summary));
                        sessionStorage.setItem('analysis_sample', JSON.stringify(sample));
                        // redirect to analysis page
                        window.location.href = 'analysis.html';
                    })
                    .catch(err => {
                        console.error('AI call failed, using fallback', err);
                        const fallback = {
                            insightsText: `Fallback: Detected ${summary.rowCount} rows. Top numeric columns: ${summary.numericColumns.join(', ')}`,
                            recommendations: ['Fallback: verify mappings', 'Fallback: inspect outliers'],
                            explanations: 'Fallback explanations based on summary'
                        };
                        sessionStorage.setItem('analysis_response', JSON.stringify(fallback));
                        sessionStorage.setItem('analysis_summary', JSON.stringify(summary));
                        sessionStorage.setItem('analysis_sample', JSON.stringify(sample));
                        window.location.href = 'analysis.html';
                    });
            },
            error: function(err) {
                console.error('Parsing error', err);
                showNotification('Failed to parse file. Please upload a valid CSV.', 'danger');
                processButton.innerHTML = 'Process Data';
                processButton.disabled = false;
            }
        });
    } else {
        // For JSON/XLSX, do a minimal read and forward to backend (or fallback)
        const reader = new FileReader();
        reader.onload = function(e) {
            let parsed = null;
            try {
                if (file.name.toLowerCase().endsWith('.json')) {
                    parsed = JSON.parse(e.target.result);
                }
            } catch (ex) {
                console.error('File read error', ex);
            }
            const sample = Array.isArray(parsed) ? parsed.slice(0,100) : [];
            const summary = buildSummary(sample, mapping);
            sendToAI({ sample, summary, mapping })
                .then(aiResp => {
                    sessionStorage.setItem('analysis_response', JSON.stringify(aiResp));
                    sessionStorage.setItem('analysis_summary', JSON.stringify(summary));
                    sessionStorage.setItem('analysis_sample', JSON.stringify(sample));
                    window.location.href = 'analysis.html';
                })
                .catch(() => {
                    const fallback = {
                        insightsText: `Fallback: Detected ${summary.rowCount} rows.`,
                        recommendations: [],
                        explanations: ''
                    };
                    sessionStorage.setItem('analysis_response', JSON.stringify(fallback));
                    sessionStorage.setItem('analysis_summary', JSON.stringify(summary));
                    sessionStorage.setItem('analysis_sample', JSON.stringify(sample));
                    window.location.href = 'analysis.html';
                });
        };
        reader.readAsText(file);
    }
}

function buildSummary(rows, mapping = {}) {
    const sampleCount = rows.length;
    const numericColumns = new Set();
    const colStats = {};
    const sampleForTop = []; // keep name + numeric for grouping if mapping provided

    rows.forEach(row => {
        Object.keys(row).forEach(col => {
            const raw = row[col];
            const num = parseFloat(('' + raw).replace(/[^0-9.\-]/g, ''));
            if (!isNaN(num) && isFinite(num)) {
                // count numeric appearances
                colStats[col] = colStats[col] || { numericCount: 0, sum: 0 };
                colStats[col].numericCount += 1;
                colStats[col].sum += num;
            } else {
                colStats[col] = colStats[col] || { numericCount: 0, sum: 0 };
            }
        });

        // gather for potential top products
        const prodKey = mapping['Product Name'] || mapping['product_name'] || 'product';
        const volKey = mapping['Sales Volume'] || mapping['quantity_sold'] || 'quantity';
        const prod = row[prodKey];
        const vol = parseFloat(('' + (row[volKey] || '')).replace(/[^0-9.\-]/g, ''));
        if (prod && !isNaN(vol)) sampleForTop.push([prod, vol]);
    });

    // numericColumns: those with numericCount > 20% of rows or >1
    Object.keys(colStats).forEach(col => {
        if (colStats[col].numericCount > Math.max(1, sampleCount * 0.2)) numericColumns.add(col);
    });

    // compute top products
    const productAgg = {};
    sampleForTop.forEach(([p, v]) => {
        productAgg[p] = (productAgg[p] || 0) + v;
    });
    const topProducts = Object.entries(productAgg).sort((a,b)=>b[1]-a[1]).slice(0,10);

    return {
        rowCount: sampleCount,
        numericColumns: Array.from(numericColumns),
        topProducts,
        mapping
    };
}

async function sendToAI(payload) {
    // Try calling backend if available, otherwise return a rich simulated response so the UI works offline.
    // Uses AbortController to set a short timeout for the fetch.
    const buildFallback = (payload) => {
        const rows = (payload.sample && Array.isArray(payload.sample)) ? payload.sample : [];
        // quick KPI calc
        let totalRevenue = 0, totalUnits = 0;
        rows.forEach(r => {
            const qty = parseFloat(r.quantity_sold || r.units_sold || r.sales_last_30d || 0) || 0;
            const price = parseFloat(r.price || r.amount || 0) || 0;
            totalUnits += qty;
            totalRevenue += qty * price;
        });
        const avgPrice = totalUnits ? Math.round((totalRevenue/totalUnits)*100)/100 : 0;
        const kpis = { totalRevenue: Math.round(totalRevenue*100)/100, totalUnits: Math.round(totalUnits), avgPrice };

        // build mapPoints if lat/lon exist
        const mapPoints = [];
        rows.forEach(r => {
            const lat = parseFloat(r.lat || r.latitude || 0);
            const lon = parseFloat(r.lon || r.longitude || 0);
            if (lat && lon) mapPoints.push({ label: (r.product||r.competitor||r.region||'point'), lat, lon, value: parseFloat(r.quantity_sold||r.units_sold||r.sales_last_30d||0)||0 });
        });

        const topProducts = (payload.summary && payload.summary.topProducts) ? payload.summary.topProducts.slice(0,6).map(t=>({ name:t[0], value:t[1]})) : [];

        return {
            insightsText: `Simulated AI: Detected ${payload.summary?.rowCount || rows.length} rows. Top numeric columns: ${(payload.summary?.numericColumns||[]).join(', ') || 'N/A'}.`,
            recommendations: [
                'Verify mappings and ensure date columns are standardized.',
                'Set safety stock alerts for high-velocity SKUs.',
                'Run region-targeted promotions to balance demand.'
            ],
            explanations: 'This is a client-side fallback response generated because no AI server was reachable.',
            kpis,
            mapPoints,
            chartsData: { topProducts, salesTrend: { labels:['W1','W2','W3','W4'], values:[320,445,390,520] } },
            competitorStrategies: ['Differentiate on speed and service to avoid price wars.']
        };
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

        const resp = await fetch('/ai-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!resp.ok) {
            // return fallback when server responds with error
            return buildFallback(payload);
        }
        const data = await resp.json();
        // if the server returns a minimal structure, ensure consistent fields by merging with fallback keys
        const fallback = buildFallback(payload);
        return Object.assign({}, fallback, data);
    } catch (e) {
        // network error, fetch aborted, or no server — return fallback simulated AI response
        return buildFallback(payload);
    }
}

function showAPIIntegrationModal() {
    const modal = createModal('API Integration Setup', `
        <div class="modal-content">
            <p>Connect directly with quick-commerce platforms for real-time data sync.</p>
            <div class="integration-options">
                <div class="integration-option">
                    <h4>🔗 Direct API Access</h4>
                    <p>Connect your platform accounts for automated data collection</p>
                    <button class="option-button primary">Setup API Keys</button>
                </div>
                <div class="integration-option">
                    <h4>🤝 Partner Integration</h4>
                    <p>We'll handle the integration process for you</p>
                    <button class="option-button secondary">Contact Integration Team</button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function showContactModal() {
    const modal = createModal('Contact Sales Team', `
        <div class="modal-content">
            <p>Get in touch with our sales team for a personalized consultation.</p>
            <form class="contact-form">
                <div class="form-group">
                    <label>Company Name</label>
                    <input type="text" placeholder="Your company name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="your.email@company.com" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" placeholder="+91 XXXXX XXXXX" required>
                </div>
                <div class="form-group">
                    <label>Requirements</label>
                    <textarea placeholder="Tell us about your data needs..." rows="4"></textarea>
                </div>
                <button type="submit" class="submit-button">Schedule Consultation</button>
            </form>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    return modal;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 300px;
    `;

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    });

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.querySelector('.notification-close').click();
        }
    }, 5000);
}

function resetUpload() {
	// Reset upload area UI and controls
	const uploadArea = document.getElementById('uploadArea');
	const dataMapping = document.getElementById('dataMapping');
	const processButton = document.getElementById('processData');
	const uploadResults = document.getElementById('uploadResults');
	const fileInput = document.getElementById('fileInput');

	// Restore initial upload area content
	if (uploadArea) {
		uploadArea.innerHTML = `
			<div class="upload-visual">
				<div class="upload-icon">📁</div>
			</div>
			<div class="upload-text">
				<p><strong>Drag & drop files here</strong> or click to browse</p>
				<p class="upload-formats">Supports CSV, XLSX, JSON files up to 50MB</p>
			</div>
		`;
	}

	// Hide mapping and results
	if (dataMapping) dataMapping.style.display = 'none';
	if (uploadResults) uploadResults.style.display = 'none';
	const fileUploadSection = document.getElementById('fileUploadSection');
	if (fileUploadSection) fileUploadSection.style.display = 'none';

	// Reset process button state
	if (processButton) {
		processButton.innerHTML = 'Process Data';
		processButton.disabled = true;
	}

	// Clear file input
	if (fileInput) fileInput.value = '';
}

/* Added: parse preset CSV, build summary, generate structured AI response and redirect */
function loadPresetCSV(presetId) {
    console.log('Loading preset:', presetId);
    const csvText = PRESET_CSVS[presetId];
    
    if (!csvText) {
        console.error('No preset data found for:', presetId);
        return;
    }

    // Generate analysis data
    const analysisData = {
        kpis: {
            totalRevenue: 128750,
            totalUnits: 1150,
            avgPrice: 112.50,
            marketShare: 12.5,
            growth: 15.2
        },
        insights: [
            'Electronics category growing 22.1% YoY',
            'Beauty segment leads satisfaction at 4.8/5',
            'North region driving 32% revenue',
            'Premium tier conversion up 15%',
            'Delivery times optimized in key markets'
        ],
        warnings: [
            'Low stock alert: Face Serum (8 units)',
            'Price pressure in Electronics category',
            'Delivery delays in South region',
            'Stock levels critical for top SKUs',
            'Customer complaints increasing'
        ],
        competitorStrategies: [
            'CompetitorA dropping prices in Electronics',
            'CompetitorB expanding premium segment',
            'CompetitorC launching subscriptions',
            'New players entering South region',
            'Market leaders investing in dark stores'
        ],
        recommendations: [
            'Implement dynamic pricing in Electronics',
            'Increase safety stock for top 5 SKUs',
            'Launch premium delivery service',
            'Expand Beauty category assortment',
            'Deploy automated reordering system'
        ],
        chartsData: {
            topProducts: [
                { name: 'Wireless Headphones', value: 120, revenue: 7199, growth: 15.2 },
                { name: 'Smart Watch', value: 85, revenue: 11049, growth: 22.1 },
                { name: 'Face Serum', value: 150, revenue: 3749, growth: 18.5 },
                { name: 'Running Shoes', value: 90, revenue: 7199, growth: -2.3 },
                { name: 'Premium Coffee', value: 175, revenue: 4373, growth: 12.8 }
            ],
            salesTrend: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                values: [320445, 390520, 445320, 520390]
            }
        },
        mapPoints: [
            { label: 'North Hub', lat: 28.7041, lon: 77.1025, value: 450, revenue: 45000 },
            { label: 'South Hub', lat: 12.9716, lon: 77.5946, value: 320, revenue: 32000 },
            { label: 'West Hub', lat: 19.0760, lon: 72.8777, value: 380, revenue: 38000 }
        ],
        insightsText: 'Analysis reveals strong performance in Electronics with 22.1% YoY growth. Beauty category leads customer satisfaction. North region contributes 32% of revenue.'
    };

    console.log('Generated analysis data:', analysisData);

    // Store data
    sessionStorage.setItem('analysis_response', JSON.stringify(analysisData));
    sessionStorage.setItem('analysis_summary', JSON.stringify({
        rowCount: 1150,
        numericColumns: ['quantity_sold', 'price', 'growth_rate']
    }));

    // Navigate to analysis page
    showNotification('Analyzing e-commerce data...', 'success');
    setTimeout(() => { window.location.href = 'analysis.html'; }, 800);
}

// Add modal and notification styles
const style = document.createElement('style');
style.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    }

    .modal {
        background: var(--bg-primary);
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideInUp 0.3s ease;
    }

    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        font-weight: 700;
        color: var(--text-primary);
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-secondary);
        cursor: pointer;
    }

    .modal-body {
        padding: 1.5rem;
    }

    .integration-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .integration-option {
        padding: 1.5rem;
        border: 2px solid var(--border-light);
        border-radius: 8px;
        text-align: center;
    }

    .integration-option h4 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }

    .option-button {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
    }

    .option-button.primary {
        background: var(--gradient-primary);
        color: white;
    }

    .option-button.secondary {
        background: var(--bg-secondary);
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
    }

    .contact-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        font-weight: 500;
        color: var(--text-primary);
    }

    .form-group input,
    .form-group textarea {
        padding: 0.75rem;
        border: 1px solid var(--border-medium);
        border-radius: 6px;
        font-size: 0.875rem;
    }

    .submit-button {
        padding: 1rem;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideInUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.2rem;
        line-height: 1;
    }
`;

document.head.appendChild(style);

// ...existing code...
function generatePresetAIResponse(presetId, summary, rows) {
    const kpis = {
        totalRevenue: 128750,
        totalUnits: 1150,
        avgPrice: 112.50,
        marketShare: 12.5,
        growth: 15.2,
        customerSatisfaction: 4.4,
        conversion: 3.2,
        retention: 65,
        avgDeliveryTime: 22,
        stockHealth: 82
    };

    const insights = [
        'Electronics category leading with 22.1% YoY growth',
        'Beauty segment showing highest customer satisfaction',
        'North region driving 32% of total revenue',
        'Premium tier products outperforming budget segment',
        'Delivery times optimized in key markets'
    ];

    const warnings = [
        '⚠️ CRITICAL: Face Serum stock below reorder point (8 units)',
        '⚠️ URGENT: Competitor price undercutting in Electronics',
        '⚠️ ALERT: Delivery delays in South region',
        '⚠️ WARNING: Beauty category stock levels declining',
        '⚠️ NOTICE: Customer complaints up 5% in East zone'
    ];

    const competitorStrategies = [
        'CompetitorA aggressive pricing in Electronics (-8.3%)',
        'CompetitorB expanding premium beauty segment',
        'CompetitorC launching subscription model',
        'New market entrant disrupting South region',
        'Regional players strengthening offline presence'
    ];

    const recommendations = [
        '🎯 Implement dynamic pricing for Electronics',
        '🎯 Increase beauty category stock levels',
        '🎯 Launch premium delivery service tier',
        '🎯 Optimize South region delivery routes',
        '🎯 Deploy automated reordering system'
    ];

    const chartsData = {
        topProducts: [
            { name: 'Wireless Headphones', value: 120, revenue: 7199, growth: 15.2, stock: 45 },
            { name: 'Smart Watch', value: 85, revenue: 11049, growth: 22.1, stock: 28 },
            { name: 'Face Serum', value: 150, revenue: 3749, growth: 18.5, stock: 12 },
            { name: 'Running Shoes', value: 90, revenue: 7199, growth: -2.3, stock: 55 },
            { name: 'Premium Coffee', value: 175, revenue: 4373, growth: 12.8, stock: 85 }
        ],
        salesTrend: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: [320445, 390520, 445320, 520390]
        },
        categoryShare: {
            labels: ['Electronics', 'Beauty', 'Fashion', 'Groceries', 'Home'],
            values: [35, 28, 15, 12, 10]
        },
        regionalPerformance: {
            labels: ['North', 'South', 'East', 'West'],
            values: [45, 32, 28, 35]
        }
    };

    return {
        kpis,
        insights,
        warnings,
        competitorStrategies,
        recommendations,
        chartsData,
        mapPoints: rows.map(r => ({
            label: r.product,
            lat: r.lat,
            lon: r.lon,
            value: r.quantity_sold,
            revenue: r.quantity_sold * r.price,
            growth: r.growth_rate,
            categories: [r.category],
            trend: r.growth_rate > 0 ? 'up' : 'down'
        })),
        insightsText: `Quick Commerce Analysis: Dataset reveals strong performance in Electronics (₹${kpis.totalRevenue.toLocaleString()} revenue) with ${kpis.marketShare}% market share. Beauty category shows emerging opportunities with 22.1% growth rate. North region leads with 32% revenue contribution. Customer satisfaction trending at ${kpis.customerSatisfaction}/5.`,
        predictions: {
            nextQuarter: {
                revenue: { value: kpis.totalRevenue * 1.15, confidence: 0.85 },
                volume: { value: kpis.totalUnits * 1.12, confidence: 0.82 }
            },
            marketHeatmap: {
                metrics: ['Growth', 'Share', 'Satisfaction'],
                regions: ['North', 'South', 'East', 'West'],
                values: [
                    [0.8, 0.7, 0.9],
                    [0.6, 0.5, 0.7],
                    [0.7, 0.6, 0.8],
                    [0.5, 0.8, 0.6]
                ]
            }
        }
    };
}