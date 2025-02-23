from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

transactionFile = "transactions.json"

# Check if file exists, if so read, else create
def transactionData():
    if not os.path.exists(transactionFile):
        with open(transactionFile, "w") as file:
            create = {"id": 1, "transactions": []}
            json.dump(create, file)
        return create
    else:
        with open(transactionFile, "r") as file:
            data = json.load(file)
            data = {"id": 1, "transactions": []}
        return data

# Add transaction to file
def addTransaction(data):
    with open(transactionFile, "w") as file:
        json.dump(data, file, indent=4)

# Return valid
@app.route('/transactions', methods=['GET'])
def get_transactions():
    data = transactionData()
    return jsonify(data["transactions"]), 200

# Return error or created, inc id
@app.route('/transactions', methods=['POST'])
def add_transaction():
    required = request.get_json()
    required_fields = ["type", "amount", "category", "itemName", "date"]
    if not required or not all(field in required for field in required_fields):
        return jsonify({"error": "All fields required)"}), 400

    data = transactionData()
    transaction = {
        "id": data["id"],
        "type": required["type"],
        "amount": required["amount"],
        "category": required["category"],
        "itemName": required["itemName"],
        "date": required["date"]
    }
    data["transactions"].append(transaction)
    data["id"] += 1
    addTransaction(data)
    return jsonify(transaction), 201

# Update existing transaction
@app.route('/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    required = request.get_json()
    if not required:
        return jsonify({"error": "Invalid data"}), 400

    data = transactionData()
    for transaction in data["transactions"]:
        if transaction["id"] == transaction_id:
            transaction["type"] = required.get("type", transaction["type"])
            transaction["amount"] = required.get("amount", transaction["amount"])
            transaction["category"] = required.get("category", transaction["category"])
            transaction["itemName"] = required.get("itemName", transaction["itemName"])
            transaction["date"] = required.get("date", transaction["date"])
            addTransaction(data)
            return jsonify(transaction), 200
    return jsonify({"error": "Transaction does not exist"}), 404

# Delete existing transaction
@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    data = transactionData()
    for transaction in data["transactions"]:
        if transaction["id"] == transaction_id:
            data["transactions"].remove(transaction)
            addTransaction(data)
            return jsonify({"message": "Transaction deleted"}), 200
    return jsonify({"error": "Transaction does not exist"}), 404

if __name__ == '__main__':
    app.run(port=5001, debug=True)
