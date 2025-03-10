from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

transactionFile = "transactions.json"

# Load Transactions from JSON
def load_transactions():
    with open('transactions.json', 'r') as file:
        transactions = json.load(file)
        for transaction in transactions:
            transaction["id"] = int(transaction["id"])
        print(f"Transactions loaded: {transactions}")  
        return transactions


def save_transactions(transactions):
    try:
        with open('transactions.json', 'w') as file:
            json.dump(transactions, file, indent=4)
            print("Transactions saved successfully!")
    except Exception as e:
        print(f"Error saving transactions: {str(e)}")

@app.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        email = request.args.get("email")
        print(f"Received GET request for transactions with email: {email}")
        
        if not email:
            raise ValueError("Email parameter is missing")
        
        transactions = load_transactions()
        print(f"Loaded transactions: {transactions}")
        
        user_transactions = [t for t in transactions if t.get("email") == email]
        print(f"Filtered transactions: {user_transactions}")

        return jsonify(user_transactions), 200
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500


# Add a new transaction
def generate_unique_id():
    transactions = load_transactions()
    if transactions:
        highest_id = max(transaction["id"] for transaction in transactions)
    else:
        highest_id = 0  
    return highest_id + 1 

@app.route('/transactions', methods=['POST'])
def add_transaction():
    try:
        new_transaction = request.get_json()
        print(f"Received POST request to add transaction: {new_transaction}")

        required_fields = ["type", "amount", "category", "itemName", "date", "email"]
        if not new_transaction or not all(field in new_transaction for field in required_fields):
            return jsonify({"error": "All fields are required"}), 400
        new_transaction["id"] = generate_unique_id()

        transactions = load_transactions()
        transactions.append(new_transaction)
        save_transactions(transactions) 

        print(f"Transaction added: {new_transaction}")
        return jsonify(new_transaction), 201
    except Exception as e:
        print(f"Error occurred while adding transaction: {str(e)}")
        return jsonify({"error": str(e)}), 500



# Update an existing transaction
@app.route('/transactions/<int:id>', methods=['PUT'])
def update_transaction(id):
    try:
        transaction_data = request.get_json()
        transactions = load_transactions()

        # Find the transaction to update
        transaction = None
        for t in transactions:
            if t["id"] == id:
                transaction = t
                break
        
        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404
        
        # Update the transaction
        transaction.update(transaction_data)
        save_transactions(transactions)  # Save the updated list back to file
        
        return jsonify(transaction), 200
    except Exception as e:
        print(f"Error updating transaction: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Delete a transaction
@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "User email is required"}), 400

        transactions = load_transactions()

        transaction_to_delete = None
        for t in transactions:
            if t['id'] == transaction_id and t['email'] == email:
                transaction_to_delete = t
                break

        if not transaction_to_delete:
            return jsonify({"error": "Transaction not found or unauthorized"}), 404
        transactions.remove(transaction_to_delete)
        save_transactions(transactions) 

        return jsonify({"message": "Transaction deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting transaction: {e}")
        return jsonify({"error": "Internal server error"}), 500



if __name__ == '__main__':
    app.run(port=5003, debug=True)
