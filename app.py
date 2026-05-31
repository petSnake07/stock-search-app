from flask import Flask, render_template, request, jsonify, make_response
import requests
import sqlite3
import json
from datetime import datetime, timedelta

app = Flask(__name__)

API_KEY = "892b65fe5678cee9ed313eedcd60dd98da636ec9"
DB_NAME = "search_history.db"


def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS SearchHistory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS CachedStockData (
                ticker TEXT PRIMARY KEY,
                company_json TEXT,
                stock_json TEXT,
                last_updated DATETIME
            )
        """)


def save_search(ticker):
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute("INSERT INTO SearchHistory (ticker) VALUES (?)", (ticker.upper(),))


def get_cached_data(ticker):
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM CachedStockData WHERE ticker = ?",
            (ticker.upper(),)
        ).fetchone()

    if not row:
        return None

    last_updated = datetime.fromisoformat(row["last_updated"])

    if datetime.utcnow() - last_updated < timedelta(minutes=15):
        return {
            "company": json.loads(row["company_json"]),
            "stock": json.loads(row["stock_json"])
        }

    return None


def update_cache(ticker, company_data, stock_data):
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute("""
            INSERT OR REPLACE INTO CachedStockData
            (ticker, company_json, stock_json, last_updated)
            VALUES (?, ?, ?, ?)
        """, (
            ticker.upper(),
            json.dumps(company_data),
            json.dumps(stock_data),
            datetime.utcnow().isoformat()
        ))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/stock")
def get_stock():
    ticker = request.args.get("ticker", "").strip().upper()

    if not ticker:
        return jsonify({"error": "Please fill out this field"}), 400

    cached = get_cached_data(ticker)
    if cached:
        save_search(ticker)
        response = make_response(jsonify(cached))
        response.headers["X-Cache"] = "HIT"
        return response

    try:
        company_url = f"https://api.tiingo.com/tiingo/daily/{ticker}?token={API_KEY}"
        stock_url = f"https://api.tiingo.com/iex/{ticker}?token={API_KEY}"

        company_response = requests.get(company_url)
        stock_response = requests.get(stock_url)

        if company_response.status_code != 200 or stock_response.status_code != 200:
            return jsonify({"error": "Error: No record has been found, please enter a valid symbol."}), 404

        company_data = company_response.json()
        stock_data = stock_response.json()

        if not company_data or not stock_data:
            return jsonify({"error": "Error: No record has been found, please enter a valid symbol."}), 404

        if isinstance(stock_data, list):
            stock_data = stock_data[0] if len(stock_data) > 0 else None

        if not stock_data:
            return jsonify({"error": "Error: No record has been found, please enter a valid symbol."}), 404

        save_search(ticker)
        update_cache(ticker, company_data, stock_data)

        response = make_response(jsonify({
            "company": company_data,
            "stock": stock_data
        }))
        response.headers["X-Cache"] = "MISS"
        return response

    except Exception:
        return jsonify({"error": "Error: No record has been found, please enter a valid symbol."}), 500


@app.route("/history")
def history():
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("""
            SELECT ticker, timestamp
            FROM SearchHistory
            ORDER BY id DESC
            LIMIT 10
        """).fetchall()

    return jsonify([dict(row) for row in rows])


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=8000, debug=True)


init_db()