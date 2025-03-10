from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Microservices
LOGIN_API = "http://127.0.0.1:5001/api"
BUDGET_API = "http://127.0.0.1:5002/budget"
TRANSACTION_API = "http://127.0.0.1:5003/transactions"
RECOMMEND_API = "http://127.0.0.1:5004/recommend"

# Login page
@app.route("/")
def loginPage():
    return render_template("login.html")

# Home page
@app.route("/home")
def home():
    return render_template("home.html")

# Handles transactions - GET, PUT, POST 
@app.route("/transactions", methods=["GET", "PUT", "POST"])
def transactions():
    # Retrieve transactions 
    if request.method == "GET":
        email = request.args.get("email")
        response = requests.get(f"http://127.0.0.1:5003/transactions?email={email}")
        return jsonify(response.json()), response.status_code
    # Update transaction 
    elif request.method == "PUT":
        data = request.json
        response = requests.post("http://127.0.0.1:5003/transactions", json=data)
        return jsonify(response.json()), response.status_code
    # Add new transaction    
    elif request.method == "POST":
        data = request.json
        response = requests.post("http://127.0.0.1:5003/transactions", json=data)
        return jsonify(response.json()), response.status_code

# Delete a transaction based on the transaction ID
@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "User email is required"}), 400
    
    response = requests.delete(f"{TRANSACTION_API}/{transaction_id}?email={email}")
    return jsonify(response.json()), response.status_code

# Retrieve budget 
@app.route("/budget", methods=["GET"])
def get_budget():
    response = requests.get(BUDGET_API)
    return jsonify(response.json())

# Get recommendations 
@app.route("/recommendation", methods=["POST"])
def get_recommendation():
    data = request.json
    response = requests.post(RECOMMEND_API, json=data)
    return jsonify(response.json())

# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    response = requests.post(f"{LOGIN_API}/login", json=data)
    return jsonify(response.json())

# Create account
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    response = requests.post(f"{LOGIN_API}/users", json=data)
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True, port=5000)  
