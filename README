# Stock Search Web Application

A full-stack stock search web application built using Flask, SQLite, JavaScript, and AWS EC2. The application allows users to search stock information, retrieve real-time market data from the Tiingo API, view historical searches, and utilize server-side caching to improve performance.

---

## Features

### Stock Search

* Search stocks using ticker symbols (e.g., AAPL, TSLA, MSFT)
* Retrieve real-time company and stock information from the Tiingo API
* Input validation and error handling for invalid ticker symbols

### Company Outlook

Displays:

* Company Name
* Stock Ticker Symbol
* Exchange Code
* Company Start Date
* Company Description

### Stock Summary

Displays:

* Trading Day
* Previous Closing Price
* Opening Price
* High Price
* Low Price
* Last Price
* Daily Change
* Daily Change Percentage
* Trading Volume

Includes visual indicators for positive and negative price changes.

### Search History

Stores successful searches in SQLite and displays the 10 most recent stock searches.

### API Caching

To reduce unnecessary API requests:

* Stock data is cached in SQLite
* Cached entries remain valid for 15 minutes
* Cache status is displayed using:

```text
X-Cache: HIT
X-Cache: MISS
```

---

## Technologies Used

### Backend

* Python
* Flask
* SQLite
* Requests

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API

### Cloud Deployment

* AWS EC2
* Amazon Linux 2023
* Gunicorn

### External APIs

* Tiingo Stock API

---

## Architecture

```text
Browser
   ↓
JavaScript Fetch API
   ↓
Flask Backend
   ↓
SQLite Database
   ↓
Tiingo API
```

---

## Database Schema

### SearchHistory

```sql
CREATE TABLE SearchHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### CachedStockData

```sql
CREATE TABLE CachedStockData (
    ticker TEXT PRIMARY KEY,
    company_json TEXT,
    stock_json TEXT,
    last_updated DATETIME
);
```

---

## API Endpoints

### Home Page

```http
GET /
```

Returns the main application page.

---

### Search Stock

```http
GET /stock?ticker=AAPL
```

Returns:

```json
{
  "company": {...},
  "stock": {...}
}
```

---

### Search History

```http
GET /history
```

Returns the 10 most recent searches:

```json
[
  {
    "ticker": "AAPL",
    "timestamp": "2026-05-10 12:00:00"
  }
]
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/petSnake07/stock-search.git
cd stock-search
```

### Install Dependencies

```bash
pip install flask requests gunicorn
```

### Run Application

```bash
python app.py
```

or

```bash
gunicorn -b 0.0.0.0:8000 app:app
```

---

## AWS Deployment

This application was deployed on:

* Amazon EC2
* Amazon Linux 2023
* Gunicorn

Security Groups were configured to allow incoming traffic on:

```text
Port 8000
```

---

## Example Search

Search:

```text
AAPL
```

Returns:

### Company Outlook

* Apple Inc.
* NASDAQ
* Company description

### Stock Summary

* Daily trading information
* Price changes
* Trading volume
