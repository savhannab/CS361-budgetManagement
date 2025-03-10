from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)


def generate_recommendations(income, expenses, balance):
    savings_percentage = (balance / income) * 100 if income > 0 else 0
    expense_ratio = (expenses / income) * 100 if income > 0 else 0

    if balance <= 0:
        return "Consider reducing unnecessary expenses."
    elif savings_percentage < 10:
        return "Your current balance is low. Try to save at least 20% of your income."
    elif expense_ratio > 70:
        return "Your expenses are too high. Aim to keep expenses below 50% of your income."
    elif 50 <= expense_ratio <= 70:
        return "Your spending is okay, but you should try to save more."
    elif savings_percentage > 20:
        return "You have good savings. Consider investing for a greater possible return."
    else:
        return "Good job! You are making good progress."

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    
    if not data or "income" not in data or "expenses" not in data or "balance" not in data:
        return jsonify({"error": "Invalid input."}), 400

    income = float(data["income"])
    expenses = float(data["expenses"])
    balance = float(data["balance"])

    recommendation = generate_recommendations(income, expenses, balance)

    return jsonify({"recommendation": recommendation})

if __name__ == '__main__':
    app.run(port=5004, debug=True)
