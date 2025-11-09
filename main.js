document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href") || "";
      if (href.endsWith(".html") && !href.includes("#")) {
        e.preventDefault();
        document.body.classList.add("page-exit");
        setTimeout(() => {
          window.location.href = href;
        }, 260);
      }
    });
  });

  const cardInput = document.getElementById("pm-card");
  if (cardInput) {
    cardInput.addEventListener("input", function () {
      this.value = this.value
        .replace(/\D/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
    });
  }
});

// ==============================
//      OPEN PAYMENT MODAL
// ==============================
function openPaymentModal(plan, amount) {
  const modal = document.getElementById("paymentModal");
  modal.classList.remove("hidden");

  // Hide all screens first
  hideAllScreens();

  // If enterprise plan → show contact sales screen
  if (amount === 0) {
    document.getElementById("pm-screen-enterprise").classList.remove("hidden");
    return;
  }

  // For paid plans → show payment mode selector
  document.getElementById("pm-screen-modes").classList.remove("hidden");

  // Store plan name for success message
  window.selectedPlan = plan;
}

// Hide all screens
function hideAllScreens() {
  document
    .querySelectorAll(".pm-screen")
    .forEach((s) => s.classList.add("hidden"));
}

// ==============================
//       PAYMENT MODE SELECT
// ==============================
function openPaymentForm(mode) {
  hideAllScreens();
  document.getElementById("pm-screen-form").classList.remove("hidden");

  const body = document.getElementById("pm-form-body");
  const title = document.getElementById("pm-form-title");

  if (mode === "UPI") {
    title.innerText = "Pay via UPI";
    body.innerHTML = `
      <label class="pm-label">UPI ID
        <input id="upi-id" placeholder="example@upi" required />
      </label>
    `;
  }

  if (mode === "Card") {
    title.innerText = "Pay via Card";
    body.innerHTML = `
      <label class="pm-label">Name on Card
        <input id="card-name" required />
      </label>
      <label class="pm-label">Card Number
        <input id="card-number" maxlength="19" placeholder="4242 4242 4242 4242" required />
      </label>
      <div class="pm-row">
        <label class="pm-label small">Expiry
          <input id="card-exp" maxlength="5" placeholder="MM/YY" required />
        </label>
        <label class="pm-label small">CVV
          <input id="card-cvv" maxlength="3" placeholder="123" required />
        </label>
      </div>
    `;
  }

  if (mode === "NetBanking") {
    title.innerText = "Net Banking";
    body.innerHTML = `
      <label class="pm-label">Select Bank
        <select id="bank-select">
          <option>SBI</option>
          <option>HDFC Bank</option>
          <option>ICICI Bank</option>
          <option>Axis Bank</option>
          <option>Kotak</option>
        </select>
      </label>
    `;
  }

  if (mode === "Wallets") {
    title.innerText = "Wallet Payment";
    body.innerHTML = `
      <label class="pm-label">Select Wallet
        <select id="wallet-select">
          <option>Paytm</option>
          <option>PhonePe</option>
          <option>Amazon Pay</option>
          <option>Mobikwik</option>
        </select>
      </label>
    `;
  }

  window.selectedMode = mode;
}

function backToModes() {
  hideAllScreens();
  document.getElementById("pm-screen-modes").classList.remove("hidden");
}

// ==============================
//        PROCESS PAYMENT
// ==============================
function processFakePayment() {
  hideAllScreens();
  document.getElementById("pm-screen-processing").classList.remove("hidden");

  setTimeout(() => {
    hideAllScreens();

    document.getElementById("pm-screen-success").classList.remove("hidden");
    document.getElementById(
      "pm-success-msg"
    ).innerText = `Your subscription for ${window.selectedPlan} is now active.`;
  }, 1200);
}

// ==============================
//         CLOSE MODAL
// ==============================
function closePaymentModal() {
  document.getElementById("paymentModal").classList.add("hidden");
}
