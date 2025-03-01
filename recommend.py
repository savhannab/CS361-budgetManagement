from flask import Flask, request, jsonify

app = Flask(__name__)

def generate_recommendations(income, expenses, balance):
    recommendations = []

    savings_percentage = (balance / income) * 100 if income > 0 else 0
    expense_ratio = (expenses / income) * 100 if income > 0 else 0

    # General recommendations
    if balance <= 0:
        recommendations.append("Consider reducing unnecessary expenses.")
    elif savings_percentage < 10:
        recommendations.append("Your current balance is low. Try to save at least 20% of your income.")
    else:
        recommendations.append("Good job! You are making goood progress.")

    # Expense control
    if expense_ratio > 70:
        recommendations.append("Your expenses are too high. Aim to keep expenses below 50% of your income.")
    elif 50 <= expense_ratio <= 70:
        recommendations.append("Your spending is okay, but you should try to save more.")

    # Investment suggestions
    if savings_percentage > 20:
        recommendations.append("You have good savings. Consider investing for more savings.")

    return recommendations

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    
    if not data or "income" not in data or "expenses" not in data or "balance" not in data:
        return jsonify({"error": "Invalid input."}), 400

    income = float(data["income"])
    expenses = float(data["expenses"])
    balance = float(data["balance"])

    recommendations = generate_recommendations(income, expenses, balance)

    return jsonify({"recommendations": recommendations})

if __name__ == '__main__':
    app.run(port=5003, debug=True)
