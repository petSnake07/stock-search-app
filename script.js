let currentCompany = null;
let currentStock = null;

async function searchStock() {
  const tickerInput = document.getElementById("ticker");
  const ticker = tickerInput.value.trim();

  if (!ticker) {
    tickerInput.reportValidity();
    return;
  }

  document.getElementById("error").textContent = "";
  document.getElementById("cacheMessage").textContent = "";

  try {
    const response = await fetch(`/stock?ticker=${encodeURIComponent(ticker)}`);
    const cacheStatus = response.headers.get("X-Cache");
    const data = await response.json();

    if (!response.ok) {
      document.getElementById("tabs").style.display = "none";
      document.getElementById("outlook").innerHTML = "";
      document.getElementById("summary").innerHTML = "";
      document.getElementById("history").innerHTML = "";
      document.getElementById("error").textContent = data.error;
      return;
    }

    currentCompany = data.company;
    currentStock = data.stock;

    document.getElementById("tabs").style.display = "block";

    if (cacheStatus === "HIT") {
      document.getElementById("cacheMessage").textContent = "Served from cache";
    }

    renderCompanyOutlook();
    renderStockSummary();
    showTab("outlook");

  } catch (error) {
    document.getElementById("error").textContent =
      "Error: No record has been found, please enter a valid symbol.";
  }
}

function renderCompanyOutlook() {
  document.getElementById("outlook").innerHTML = `
    <table>
      <tr><td>Company Name</td><td>${currentCompany.name || ""}</td></tr>
      <tr><td>Stock Ticker Symbol</td><td>${currentCompany.ticker || ""}</td></tr>
      <tr><td>Exchange Code</td><td>${currentCompany.exchangeCode || ""}</td></tr>
      <tr><td>Company Start Date</td><td>${currentCompany.startDate || ""}</td></tr>
      <tr><td>Description</td><td><div class="description">${currentCompany.description || ""}</div></td></tr>
    </table>
  `;
}

function renderStockSummary() {
  const last = currentStock.last ?? currentStock.tngoLast;
  const prevClose = currentStock.prevClose;
  const change = last - prevClose;
  const changePercent = (change / prevClose) * 100;
  const arrow = change >= 0
    ? `<span class="up">▲</span>`
    : `<span class="down">▼</span>`;

  const date = currentStock.timestamp
    ? currentStock.timestamp.split("T")[0]
    : "";

  document.getElementById("summary").innerHTML = `
    <table>
      <tr><td>Stock Ticker Symbol</td><td>${currentStock.ticker || ""}</td></tr>
      <tr><td>Trading Day</td><td>${date}</td></tr>
      <tr><td>Previous Closing Price</td><td>${prevClose}</td></tr>
      <tr><td>Opening Price</td><td>${currentStock.open}</td></tr>
      <tr><td>High Price</td><td>${currentStock.high}</td></tr>
      <tr><td>Low Price</td><td>${currentStock.low}</td></tr>
      <tr><td>Last Price</td><td>${last}</td></tr>
      <tr><td>Change</td><td>${change.toFixed(2)} ${arrow}</td></tr>
      <tr><td>Change Percent</td><td>${changePercent.toFixed(2)}% ${arrow}</td></tr>
      <tr><td>Number of Shares Traded</td><td>${currentStock.volume}</td></tr>
    </table>
  `;
}

async function loadHistory() {
  showTab("history");

  const response = await fetch("/history");
  const history = await response.json();

  let html = `
    <table>
      <tr>
        <td>Ticker</td>
        <td>Timestamp</td>
      </tr>
  `;

  history.forEach(row => {
    html += `
      <tr>
        <td>${row.ticker}</td>
        <td>${row.timestamp}</td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("history").innerHTML = html;
}

function showTab(tabName) {
  document.getElementById("outlook").style.display = "none";
  document.getElementById("summary").style.display = "none";
  document.getElementById("history").style.display = "none";

  document.getElementById(tabName).style.display = "block";

  const buttons = document.querySelectorAll(".tab");
  buttons.forEach(button => button.classList.remove("active"));

  if (tabName === "outlook") buttons[0].classList.add("active");
  if (tabName === "summary") buttons[1].classList.add("active");
  if (tabName === "history") buttons[2].classList.add("active");
}

function clearPage() {
  document.getElementById("ticker").value = "";
  document.getElementById("error").textContent = "";
  document.getElementById("cacheMessage").textContent = "";
  document.getElementById("tabs").style.display = "none";
  document.getElementById("outlook").innerHTML = "";
  document.getElementById("summary").innerHTML = "";
  document.getElementById("history").innerHTML = "";
}