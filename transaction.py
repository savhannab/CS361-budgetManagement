from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

transactionFile = "transactions.json"

# Load Transactions from JSON
def load_transactions():
    if not os.path.exists(transactionFile):
        with open(transactionFile, "w") as file:
            json.dump([], file)

    try:
        with open(transactionFile, "r") as file:
            transactions = json.load(file)
            if not isinstance(transactions, list): 
                return []
            return transactions
    except json.JSONDecodeError:
        return []


# Save Transactions to JSON
def save_transactions(data):
    with open(transactionFile, "w") as file:
        json.dump(data, file, indent=4)

# Get all transactions
@app.route('/transactions', methods=['GET'])
def get_transactions():
    transactions = load_transactions()
    return jsonify(transactions), 200  

# Add a new transaction
@app.route('/transactions', methods=['POST'])
def add_transaction():
    new_transaction = request.get_json()
    required_fields = ["type", "amount", "category", "itemName", "date"]

    if not new_transaction or not all(field in new_transaction for field in required_fields):
        return jsonify({"error": "All fields are required"}), 400

    transactions = load_transactions()

    print("DEBUG: Type of transactions =", type(transactions)) 

    if not isinstance(transactions, list):
        return jsonify({"error": "Transactions data is corrupted. Expected a list."}), 500

    new_transaction["id"] = len(transactions) + 1
    transactions.append(new_transaction)
    save_transactions(transactions)

    return jsonify(new_transaction), 201

# Update an existing transaction
@app.route('/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    updated_data = request.get_json()
    if not updated_data:
        return jsonify({"error": "Invalid data"}), 400

    transactions = load_transactions()
    for transaction in transactions:
        if transaction["id"] == transaction_id:
            transaction.update(updated_data) 
            save_transactions(transactions)
            return jsonify(transaction), 200

    return jsonify({"error": "Transaction does not exist"}), 404

# Delete a transaction
@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    transactions = load_transactions()
    updated_transactions = [tx for tx in transactions if tx["id"] != transaction_id]

    if len(updated_transactions) == len(transactions): 
        return jsonify({"error": "Transaction does not exist"}), 404

    save_transactions(updated_transactions)
    return jsonify({"message": "Transaction deleted"}), 200

if __name__ == '__main__':
    app.run(port=5001, debug=True)
