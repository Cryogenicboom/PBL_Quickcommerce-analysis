/* =========================================================
   DIGIPINE — Unified Data + Charts
   - Keeps your heatmap behavior
   - Adds partner charts (Delivery, Fraud, Alerts, Zone grid)
   - Unique data for Product × Region × Time × Platform
========================================================= */

/* ---------- DOM helpers ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const gctx = (id) => document.getElementById(id)?.getContext("2d");

/* ---------- State ---------- */
let current = {
  product: "cocacola",
  region: "all",
  time: "7days",
  platform: "all",
};

/* ---------- Static definitions ---------- */
const PRODUCTS = {
  cocacola: {
    label: "Coca Cola",
    categories: [
      "Beverages",
      "Snacks",
      "Bakery",
      "Dairy",
      "Personal Care",
      "Household",
    ],
    competitors: [
      {
        name: "Pepsi",
        strategy: "Metro discounts; college fests; bundle offers",
      },
      {
        name: "Thumbs Up",
        strategy: "South/West focus; 1L PET push; kirana loyalty",
      },
      {
        name: "Sprite",
        strategy: "Youth campaigns; combo pricing with snacks",
      },
    ],
  },
  lays: {
    label: "Lays Chips",
    categories: [
      "Snacks",
      "Beverages",
      "Bakery",
      "Dairy",
      "Personal Care",
      "Household",
    ],
    competitors: [
      { name: "Bingo", strategy: "Aggressive MRP; share bags in tier-2" },
      {
        name: "Pringles",
        strategy: "Premium placement in modern trade; can displays",
      },
    ],
  },
  dairymilk: {
    label: "Dairy Milk",
    categories: [
      "Confectionery",
      "Beverages",
      "Snacks",
      "Bakery",
      "Dairy",
      "Household",
    ],
    competitors: [
      { name: "KitKat", strategy: "Festive end-caps; break-time positioning" },
      { name: "Perk", strategy: "Value SKUs; price point dominance" },
    ],
  },
  redbull: {
    label: "Red Bull",
    categories: [
      "Energy Drinks",
      "Sports Drinks",
      "Beverages",
      "Snacks",
      "Dairy",
      "Bakery",
    ],
    competitors: [
      { name: "Monster", strategy: "Influencers; gaming/EDM events" },
      { name: "Gatorade", strategy: "Sports hydration; gym partnerships" },
    ],
  },
  nescafe: {
    label: "Nescafé",
    categories: ["Coffee", "Tea", "Beverages", "Snacks", "Dairy", "Bakery"],
    competitors: [
      { name: "Bru", strategy: "Price-led push in tier-2; refills" },
      { name: "Starbucks Instant", strategy: "Premium instant; gifting SKUs" },
    ],
  },
};

const REGIONS = {
  all: { label: "All Regions" },
  mumbai: { label: "Mumbai", lat: 19.076, lng: 72.8777 },
  delhi: { label: "Delhi NCR", lat: 28.6139, lng: 77.209 },
  bangalore: { label: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  hyderabad: { label: "Hyderabad", lat: 17.385, lng: 78.4867 },
  pune: { label: "Pune", lat: 18.5204, lng: 73.8567 },
};
const PLATFORMS = ["zepto", "blinkit", "swiggy", "others"];

/* ---------- Deterministic RNG ---------- */
function hashStr(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}
function selKey() {
  return `${current.product}|${current.region}|${current.time}|${current.platform}`;
}

/* ---------- Data synth per selection ---------- */
function generateData() {
  const prod = PRODUCTS[current.product] || PRODUCTS.cocacola;
  const r = rng(hashStr(selKey()));

  // KPIs
  const totalTracked = 2400 + Math.floor(r() * 900);
  const trending = Math.max(60, Math.floor(totalTracked * (0.07 + r() * 0.06)));
  const topRegion = [
    "Mumbai North",
    "Delhi NCR",
    "Bengaluru",
    "Hyderabad",
    "Pune",
  ][Math.floor(r() * 5)];
  const marketGrowth = +(10 + r() * 18).toFixed(1);

  // Platform distribution
  let z = 28 + r() * 14,
    b = 24 + r() * 12,
    s = 18 + r() * 12;
  let o = Math.max(8, 100 - (z + b + s));
  let platformShare = [z, b, s, o].map((v) => +v.toFixed(1));

  // Product bias for platform tab
  if (["zepto", "blinkit", "swiggy"].includes(current.platform)) {
    const idx = { zepto: 0, blinkit: 1, swiggy: 2 }[current.platform];
    platformShare = platformShare.map((v, i) =>
      i === idx ? +(v * 1.18).toFixed(1) : +(v * 0.92).toFixed(1)
    );
    const sum = platformShare.reduce((a, b) => a + b, 0);
    platformShare = platformShare.map((v) => +((v * 100) / sum).toFixed(1));
  }

  // Category trends (YOUR requested styling will be applied in chart options)
  const catLabels = prod.categories;
  const catChange = catLabels.map(() => +(15 + r() * 25).toFixed(1)); // growth %

  // Forecast series (partner style 2 lines if needed later)
  const fLabels = [
    "Electronics",
    "Groceries",
    "Fashion",
    "Beauty",
    "Home",
    "Food",
  ];
  const fCurrent = fLabels.map(() => Math.round(180 + r() * 220));
  const fForecast = fCurrent.map((v) => v + Math.round(40 + r() * 120));

  // Timeline 30 points (days) then we’ll map by metric
  const tLabels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const tSales = tLabels.map(() => Math.round(200 + r() * 500));
  const tGrowth = tLabels.map(() => +(1 + r() * 6).toFixed(1));
  const tShare = tLabels.map(() => +(5 + r() * 10).toFixed(1));

  // Delivery performance
  const delivery = {
    avgTime: +(10.5 + r() * 6).toFixed(1), // minutes
    onTime: +(90 + r() * 8).toFixed(1), // %
    series: tLabels.map(() => +(9 + r() * 8).toFixed(1)),
  };

  // Fraud
  const verified = Math.round(2400 + r() * 1200);
  const flagged = Math.round(40 + r() * 120);

  // Regions for map/zone grid
  const regionsData = {};
  Object.keys(REGIONS)
    .filter((k) => k !== "all")
    .forEach((k) => {
      const products = Math.round(350 + r() * 600);
      const trendingR = Math.round(products * (0.08 + r() * 0.07));
      const growthR = +(12 + r() * 14).toFixed(1);
      regionsData[k] = { products, trending: trendingR, growth: growthR };
    });

  // Competitors
  const competitors = PRODUCTS[current.product]?.competitors || [];

  return {
    kpis: { totalTracked, trending, topRegion, marketGrowth },
    platformShare,
    categoryTrend: { labels: catLabels, change: catChange },
    forecast: {
      labels: fLabels,
      current: fCurrent,
      forecast: fForecast,
      notes: [
        r() > 0.5
          ? "Weekend uplift expected (+8–15%)"
          : "Mid-week promo lift likely",
        r() > 0.5
          ? "North cluster to lead sales"
          : "Tier-1 metros > Tier-2 by ~1.3x",
      ],
    },
    timeline: {
      labels: tLabels,
      sales: tSales,
      growth: tGrowth,
      share: tShare,
    },
    delivery,
    fraud: { verified, flagged },
    regions: regionsData,
    competitors,
  };
}

/* ---------- Charts ---------- */
let platformChart,
  categoryChart,
  forecastChart,
  timelineChart,
  deliveryChart,
  fraudChart;

/* your heatmap */
let performanceMap; // Leaflet instance
function ensureCharts() {
  if (!platformChart && gctx("platformChart")) {
    platformChart = new Chart(gctx("platformChart"), {
      type: "doughnut",
      data: {
        labels: ["Zepto", "Blinkit", "Swiggy IM", "Others"],
        datasets: [{ data: [25, 25, 25, 25] }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
    window.platformChart = platformChart; // for integration file
  }

  if (!categoryChart && gctx("categoryTrendChart")) {
    categoryChart = new Chart(gctx("categoryTrendChart"), {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Growth %",
            data: [],
            backgroundColor: "rgba(37, 99, 235, 0.8)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            callbacks: { label: (ctx) => `Growth: +${ctx.parsed.y}%` },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.1)" },
            ticks: { callback: (v) => `+${v}%` },
          },
          x: { grid: { display: false } },
        },
        animation: { duration: 1500, easing: "easeOutQuart" },
      },
    });
    window.categoryChart = categoryChart;
  }

  if (!forecastChart && gctx("demandForecastChart")) {
    forecastChart = new Chart(gctx("demandForecastChart"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Current",
            data: [],
            borderColor: "rgba(37, 99, 235, 1)",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Forecast",
            data: [],
            borderColor: "rgba(124,58,237,1)",
            backgroundColor: "rgba(124,58,237,0.1)",
            borderWidth: 3,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { usePointStyle: true, padding: 20 },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
          },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.1)" } },
          x: { grid: { display: false } },
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        animation: { duration: 2000, easing: "easeInOutQuart" },
      },
    });
  }

  if (!timelineChart && gctx("timelineChart")) {
    timelineChart = new Chart(gctx("timelineChart"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Sales Volume",
            data: [],
            borderColor: "rgba(37,99,235,1)",
            backgroundColor: "rgba(37,99,235,0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.1)" },
            ticks: { callback: (v) => v.toLocaleString() },
          },
          x: { grid: { display: false } },
        },
        interaction: { intersect: false, mode: "index" },
        animation: { duration: 800, easing: "easeInOutQuart" },
      },
    });
  }

  if (!deliveryChart && gctx("deliveryTimeTrendChart")) {
    deliveryChart = new Chart(gctx("deliveryTimeTrendChart"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Avg Delivery Time (min)",
            data: [],
            borderWidth: 3,
            fill: false,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
      },
    });
  }

  if (!fraudChart && gctx("fraudPieChart")) {
    fraudChart = new Chart(gctx("fraudPieChart"), {
      type: "doughnut",
      data: { labels: ["Verified", "Flagged"], datasets: [{ data: [95, 5] }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }
}

/* ---------- Map (keep your behavior) ---------- */
function updateMap(regions) {
  const mapDiv = $("#performanceMap");
  if (!mapDiv) return;

  if (typeof L !== "undefined") {
    try {
      if (!performanceMap) {
        performanceMap = L.map("performanceMap", {
          center: [20.5937, 78.9629],
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 18,
          minZoom: 4,
        }).addTo(performanceMap);
        window.map = performanceMap; // expose alias for partner integration
      }
      // clear layer group
      if (performanceMap._layerGroup) {
        performanceMap.removeLayer(performanceMap._layerGroup);
      }
      const group = L.layerGroup();
      performanceMap._layerGroup = group;

      Object.entries(regions).forEach(([key, d]) => {
        const meta = REGIONS[key];
        if (!meta) return;
        const perfScore = d.growth + d.trending / 20;
        let color = "#10b981";
        if (perfScore < 20) color = "#f59e0b";
        if (perfScore < 15) color = "#ef4444";
        const size = Math.max(24, Math.min(44, d.products / 15));
        const icon = L.divIcon({
          className: "custom-performance-marker",
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;">${d.products}</div>`,
        });
        const m = L.marker([meta.lat, meta.lng], { icon }).addTo(group);
        m.bindPopup(`<div class="map-popup"><h4 class="popup-title">${meta.label}</h4>
          <div class="popup-stats">
          <div class="popup-stat"><span class="popup-label">Products Tracked:</span><span class="popup-value">${d.products}</span></div>
          <div class="popup-stat"><span class="popup-label">Trending:</span><span class="popup-value">${d.trending}</span></div>
          <div class="popup-stat"><span class="popup-label">Growth:</span><span class="popup-value">+${d.growth}%</span></div>
          </div></div>`);
      });
      group.addTo(performanceMap);
      setTimeout(() => performanceMap.invalidateSize(), 150);
    } catch (e) {
      /* fallback noop */
    }
  }
}

/* ---------- UI apply ---------- */
function applyToUI(gen) {
  // KPIs
  $("#totalProducts") &&
    ($("#totalProducts").textContent = gen.kpis.totalTracked.toLocaleString());
  $("#trendingProducts") &&
    ($("#trendingProducts").textContent = gen.kpis.trending);
  $("#topRegion") && ($("#topRegion").textContent = gen.kpis.topRegion);
  $("#marketGrowth") &&
    ($("#marketGrowth").textContent = `${gen.kpis.marketGrowth}%`);

  // Platform
  if (platformChart) {
    platformChart.data.datasets[0].data = gen.platformShare;
    platformChart.update();
    const [z, b, s, o] = gen.platformShare;
    $("#plt-zepto") && ($("#plt-zepto").textContent = `${z}%`);
    $("#plt-blinkit") && ($("#plt-blinkit").textContent = `${b}%`);
    $("#plt-swiggy") && ($("#plt-swiggy").textContent = `${s}%`);
    $("#plt-others") && ($("#plt-others").textContent = `${o}%`);
  }

  // Category (partner styling already set above)
  if (categoryChart) {
    categoryChart.data.labels = gen.categoryTrend.labels;
    categoryChart.data.datasets[0].data = gen.categoryTrend.change;
    categoryChart.update();
  }

  // Forecast (partner two-line)
  if (forecastChart) {
    forecastChart.data.labels = gen.forecast.labels;
    forecastChart.data.datasets[0].data = gen.forecast.current;
    forecastChart.data.datasets[1].data = gen.forecast.forecast;
    forecastChart.update();
    const box = $("#forecastInsights");
    if (box) {
      box.innerHTML = "";
      gen.forecast.notes.forEach((n) => {
        const el = document.createElement("div");
        el.className = "insight-item";
        el.innerHTML = `<span class="insight-icon">💡</span><span class="insight-text">${n}</span>`;
        box.appendChild(el);
      });
    }
  }

  // Timeline
  const activeBtn = document.querySelector(
    ".timeline-controls .timeline-btn.active"
  );
  const metricKey = activeBtn ? activeBtn.dataset.metric : "sales";
  const keyMap = {
    sales: "sales",
    growth: "growth",
    "market-share": "share",
    marketShare: "share",
  };
  const series = gen.timeline[keyMap[metricKey] || "sales"];
  if (timelineChart) {
    timelineChart.data.labels = gen.timeline.labels;
    timelineChart.data.datasets[0].label =
      metricKey === "growth"
        ? "Growth Rate (%)"
        : metricKey.includes("share")
        ? "Market Share (%)"
        : "Sales Volume";
    timelineChart.data.datasets[0].data = series;
    timelineChart.update();
  }

  // Competitors
  const comp = document.querySelector(".competitor-list");
  if (comp) {
    comp.innerHTML = "";
    gen.competitors.forEach((c) => {
      const row = document.createElement("div");
      row.className = "insight-item";
      row.innerHTML = `<span class="insight-icon">⚔️</span><span class="insight-text"><strong>${c.name}</strong>: ${c.strategy}</span>`;
      comp.appendChild(row);
    });
  }

  // Delivery
  if (deliveryChart) {
    deliveryChart.data.labels = gen.timeline.labels;
    deliveryChart.data.datasets[0].data = gen.delivery.series;
    deliveryChart.update();
    $("#avgDeliveryTime") &&
      ($("#avgDeliveryTime").textContent = `${gen.delivery.avgTime} min`);
    $("#onTimeRate") &&
      ($("#onTimeRate").textContent = `${gen.delivery.onTime}%`);
  }

  // Fraud
  if (fraudChart) {
    fraudChart.data.datasets[0].data = [gen.fraud.verified, gen.fraud.flagged];
    fraudChart.update();
    $("#verifiedCount") &&
      ($("#verifiedCount").textContent = gen.fraud.verified.toLocaleString());
    $("#flaggedCount") &&
      ($("#flaggedCount").textContent = gen.fraud.flagged.toLocaleString());
  }

  // Zone grid (simple fill)
  const zoneGrid = $("#zoneGrid");
  if (zoneGrid) {
    zoneGrid.innerHTML = "";
    Object.entries(gen.regions).forEach(([code, data], i) => {
      const badge =
        data.growth > 22 ? "success" : data.growth > 17 ? "warning" : "danger";
      const topCat =
        PRODUCTS[current.product].categories[
          i % PRODUCTS[current.product].categories.length
        ];
      zoneGrid.innerHTML += `
        <div class="zone-item">
          <div class="zone-header">
            <span class="zone-code">${code.toUpperCase()}</span>
            <span class="zone-badge ${badge}">${
        badge === "success"
          ? "Active"
          : badge === "warning"
          ? "Review"
          : "Critical"
      }</span>
          </div>
          <div class="zone-stats">
            <div class="stat-item"><span class="stat-label">Orders</span><span class="stat-value">${
              data.products
            }</span></div>
            <div class="stat-item"><span class="stat-label">Avg Time</span><span class="stat-value">${(
              10 +
              Math.random() * 6
            ).toFixed(1)} min</span></div>
            <div class="stat-item"><span class="stat-label">Top Category</span><span class="stat-value">${topCat}</span></div>
          </div>
        </div>`;
    });
  }

  // Map
  updateMap(gen.regions);

  // Alerts (simple demo)
  const alertsList = $("#alertsList");
  if (alertsList) {
    alertsList.innerHTML = [
      {
        level: "high",
        icon: "🚨",
        title: "High Demand Alert",
        desc: `${PRODUCTS[current.product].label} spike in ${
          REGIONS[current.region]?.label || "metros"
        }`,
        time: "2 mins ago",
      },
      {
        level: "medium",
        icon: "⚠️",
        title: "Delivery Delays",
        desc: `${REGIONS.bangalore.label} south zone affected`,
        time: "15 mins ago",
      },
      {
        level: "low",
        icon: "📊",
        title: "New Trend Detected",
        desc: "Organic products rising",
        time: "1 hour ago",
      },
    ]
      .map(
        (a) => `
      <div class="alert-item ${a.level}">
        <div class="alert-icon">${a.icon}</div>
        <div class="alert-content">
          <div class="alert-title">${a.title}</div>
          <div class="alert-desc">${a.desc}</div>
          <div class="alert-time">${a.time}</div>
        </div>
      </div>`
      )
      .join("");
  }
}

/* ---------- Selection + Refresh ---------- */
function readSelections() {
  current.product = $("#productSelector")?.value || current.product;
  current.region = $("#regionFilter")?.value || current.region;
  current.time = $("#timeFilter")?.value || current.time;
  const active = $(".platform-tab.active");
  current.platform = active?.dataset.platform || "all";
}

function updateAll() {
  readSelections();
  ensureCharts();
  let gen = generateData();

  // Region bias to feel different
  if (current.region !== "all") {
    const rv = rng(hashStr(selKey() + "|region"))();
    gen.kpis.totalTracked = Math.round(
      gen.kpis.totalTracked * (0.85 + rv * 0.4)
    );
    gen.kpis.trending = Math.max(
      30,
      Math.round(gen.kpis.trending * (0.8 + rv * 0.5))
    );
    gen.kpis.topRegion = REGIONS[current.region]?.label || gen.kpis.topRegion;
    gen.kpis.marketGrowth = +(gen.kpis.marketGrowth * (0.9 + rv * 0.3)).toFixed(
      1
    );
  }

  // Time bias
  if (current.time === "24h") {
    gen.kpis.trending = Math.max(20, Math.round(gen.kpis.trending * 0.35));
  }
  if (current.time === "30days") {
    gen.kpis.trending = Math.round(gen.kpis.trending * 1.6);
  }
  if (current.time === "90days") {
    gen.kpis.trending = Math.round(gen.kpis.trending * 2.6);
  }

  applyToUI(gen);
}

/* ---------- Events ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // initial chart/map + first paint
  updateAll();

  // filters
  $("#productSelector") &&
    $("#productSelector").addEventListener("change", updateAll);
  $("#regionFilter") &&
    $("#regionFilter").addEventListener("change", updateAll);
  $("#timeFilter") && $("#timeFilter").addEventListener("change", updateAll);
  $("#deliveryRange") &&
    $("#deliveryRange").addEventListener("change", updateAll);
  $("#mapMetric") && $("#mapMetric").addEventListener("change", updateAll);

  // platform tabs
  $$(".platform-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".platform-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateAll();
    });
  });

  // timeline metric toggles
  $$(".timeline-controls .timeline-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".timeline-controls .timeline-btn").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");
      updateAll();
    });
  });

  // manual refresh
  $("#refreshDataBtn") &&
    $("#refreshDataBtn").addEventListener("click", () => {
      const btn = $("#refreshDataBtn");

      // 1) Spin the entire button
      btn.classList.add("refresh-rotate");
      btn.classList.add("refresh-button-anim");

      setTimeout(() => {
        btn.classList.remove("refresh-rotate");
        btn.classList.remove("refresh-button-anim");
        btn.classList.add("refresh-button-anim-end");

        setTimeout(() => btn.classList.remove("refresh-button-anim-end"), 200);
      }, 600);

      // 2) Call your actual refresh logic
      updateAll();
      // Manual refresh button (keeps your existing button)
      if (document.getElementById("refreshDataBtn")) {
        document
          .getElementById("refreshDataBtn")
          .addEventListener("click", () => {
            // 1) Refresh all charts/data
            updateAll();

            // 2) Button animation
            const btn = document.getElementById("refreshDataBtn");
            btn.style.transform = "rotate(360deg)";
            btn.style.transition = "transform 0.6s ease";

            setTimeout(() => {
              btn.style.transform = "rotate(0deg)";
            }, 600);

            // 3) Blue toast notification
            const toast = document.createElement("div");
            toast.className = "refresh-toast";
            toast.innerHTML = `
            <span style="font-size: 1.2rem;"></span>
            Data refreshed successfully!
        `;

            document.body.appendChild(toast);

            setTimeout(() => {
              toast.style.animation = "slideOut 0.5s ease";
              setTimeout(() => toast.remove(), 500);
            }, 3000);
          });
      }

      // 3) Toast message (top-right)
      const toast = document.createElement("div");
      toast.className = "refresh-toast";
      toast.innerHTML = `
        <span></span> Data refreshed successfully!
      `;

      document.body.appendChild(toast);

      // Slide out + remove
      setTimeout(() => {
        toast.style.animation = "slideOut 0.5s ease";
        setTimeout(() => toast.remove(), 500);
      }, 3000);
    });
});
// Static mock zone data (same as partner)
const staticZones = [
  {
    code: "AB12-34CD",
    badge: "success",
    badgeText: "Active",
    orders: 652,
    time: "11.3 min",
    top: "Electronics",
  },
  {
    code: "XY45-78ZT",
    badge: "warning",
    badgeText: "Review",
    orders: 738,
    time: "13.2 min",
    top: "Groceries",
  },
  {
    code: "PQ99-12AA",
    badge: "danger",
    badgeText: "Critical",
    orders: 457,
    time: "14.8 min",
    top: "Food & Beverage",
  },
];

function renderStaticZones() {
  const container = document.querySelector(".zone-grid");
  if (!container) return;

  container.innerHTML = staticZones
    .map(
      (z) => `
        <div class="zone-item">
            <div class="zone-header">
                <span class="zone-code">${z.code}</span>
                <span class="zone-badge ${z.badge}">${z.badgeText}</span>
            </div>
            <div class="zone-stats">
                <div class="stat-item">
                    <span class="stat-label">Orders</span>
                    <span class="stat-value">${z.orders}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avg Time</span>
                    <span class="stat-value">${z.time}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Top Category</span>
                    <span class="stat-value">${z.top}</span>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Run on page load
document.addEventListener("DOMContentLoaded", renderStaticZones);
