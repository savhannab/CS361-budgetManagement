from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

transactionFile = "transactions.json"

# Load Transactions from JSON
def load_transactions():
    """Loads transactions from the JSON file. If the file doesn't exist, it creates an empty one."""
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
    """Saves the provided data to the JSON file."""
    with open(transactionFile, "w") as file:
        json.dump(data, file, indent=4)


@app.route('/transactions', methods=['GET'])
def get_transactions():
    """Retrieves transactions for a specific user based on their email."""
    email = request.args.get("email") 
    if not email:
        return jsonify({"error": "User email is required"}), 400

    transactions = load_transactions()
    user_transactions = [t for t in transactions if t.get("email") == email]  

    return jsonify(user_transactions), 200  

# Add a new transaction
@app.route('/transactions', methods=['POST'])
def add_transaction():
    """Adds a new transaction for the logged-in user."""
    new_transaction = request.get_json()
    required_fields = ["email", "type", "amount", "category", "itemName", "date"]

    if not new_transaction or not all(field in new_transaction for field in required_fields):
        return jsonify({"error": "All fields are required"}), 400

    transactions = load_transactions()

    if not isinstance(transactions, list):
        return jsonify({"error": "Transactions data is corrupted. Expected a list."}), 500

    new_transaction["id"] = len(transactions) + 1 
    transactions.append(new_transaction)
    save_transactions(transactions)

    return jsonify(new_transaction), 201

# Update an existing transaction
@app.route('/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Updates an existing transaction, ensuring the user can only update their own transactions."""
    updated_data = request.get_json()
    if not updated_data or "email" not in updated_data:
        return jsonify({"error": "Invalid data"}), 400

    transactions = load_transactions()
    for transaction in transactions:
        if transaction["id"] == transaction_id and transaction["email"] == updated_data["email"]: 
            transaction.update(updated_data)
            save_transactions(transactions)
            return jsonify(transaction), 200

    return jsonify({"error": "Transaction does not exist or unauthorized"}), 404

# Delete a transaction
@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    email = request.args.get("email") 
    if not email:
        return jsonify({"error": "User email is required"}), 400

    transactions = load_transactions()
    updated_transactions = [t for t in transactions if not (t["id"] == transaction_id and t["email"] == email)]

    if len(updated_transactions) == len(transactions): 
        return jsonify({"error": "Transaction does not exist or unauthorized"}), 404

    save_transactions(updated_transactions)
    return jsonify({"message": "Transaction deleted"}), 200

if __name__ == '__main__':
    app.run(port=5001, debug=True)
