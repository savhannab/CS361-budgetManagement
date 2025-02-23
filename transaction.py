from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = "transactions.json"

def read_data():
    if not os.path.exists(DATA_FILE):
        initial_data = {"next_id": 1, "transactions": []}
        with open(DATA_FILE, "w") as f:
            json.dump(initial_data, f)
        return initial_data
    else:
        with open(DATA_FILE, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = {"next_id": 1, "transactions": []}
        return data

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.route('/transactions', methods=['GET'])
def get_transactions():
    data = read_data()
    return jsonify(data["transactions"]), 200

@app.route('/transactions', methods=['POST'])
def add_transaction():
    req_data = request.get_json()
    required_fields = ["type", "amount", "category", "itemName", "date"]
    if not req_data or not all(field in req_data for field in required_fields):
        return jsonify({"error": "Missing required field(s)"}), 400

    data = read_data()
    transaction = {
        "id": data["next_id"],
        "type": req_data["type"],
        "amount": req_data["amount"],
        "category": req_data["category"],
        "itemName": req_data["itemName"],
        "date": req_data["date"]
    }
    data["transactions"].append(transaction)
    data["next_id"] += 1
    write_data(data)
    return jsonify(transaction), 201

@app.route('/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    req_data = request.get_json()
    if not req_data:
        return jsonify({"error": "Invalid data"}), 400

    data = read_data()
    for transaction in data["transactions"]:
        if transaction["id"] == transaction_id:
            transaction["type"] = req_data.get("type", transaction["type"])
            transaction["amount"] = req_data.get("amount", transaction["amount"])
            transaction["category"] = req_data.get("category", transaction["category"])
            transaction["itemName"] = req_data.get("itemName", transaction["itemName"])
            transaction["date"] = req_data.get("date", transaction["date"])
            write_data(data)
            return jsonify(transaction), 200

    return jsonify({"error": "Transaction not found"}), 404

@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    data = read_data()
    for transaction in data["transactions"]:
        if transaction["id"] == transaction_id:
            data["transactions"].remove(transaction)
            write_data(data)
            return jsonify({"message": "Transaction deleted"}), 200

    return jsonify({"error": "Transaction not found"}), 404

if __name__ == '__main__':
    app.run(port=5001, debug=True)
