from flask import Flask, request, jsonify, render_template
import json, os, time

app = Flask(__name__)
users_file, tokens_file = "users.json", "tokens.json"

# Ensure JSON files exist
for file in [users_file, tokens_file]:
    if not os.path.exists(file):
        with open(file, "w") as f:
            json.dump({}, f)

# Load & Save JSON Data
def load_json(file):
    with open(file, "r") as f:
        return json.load(f)

def save_json(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)

# Validate password
def is_valid_password(password):
    return (
        len(password) >= 8 and 
        any(c.isdigit() for c in password) and 
        any(c.isupper() for c in password) and 
        any(c in "!@#$%^&*" for c in password)
    )

# Generate token username and date
def generate_token(email):
    return f"{email}_{int(time.time())}"

@app.route("/")
def login_page():
    return render_template("login.html")

@app.route("/home")
def home_page():
    return render_template("home.html")

# Register a new user
@app.route("/api/users", methods=["POST"])
def register():
    data = request.get_json()
    users = load_json(users_file)
    tokens = load_json(tokens_file)

    email = data.get("email", "").strip().lower()

    # All fields required
    if not all([data.get("firstName"), data.get("lastName"), email, data.get("password"), data.get("confirmPassword")]):
        return jsonify({"error": "All fields are required"}), 400

    # Confirm passwords match
    if data["password"] != data["confirmPassword"]:
        return jsonify({"error": "Passwords do not match"}), 400

    # Validate password 
    if not is_valid_password(data["password"]):
        return jsonify({"error": "Password must be at least 8 characters, include an uppercase letter, a number, and a special character."}), 400

    # Check if email already exists
    if email in users:
        return jsonify({"error": "User already exists"}), 409

    # Save new user (Add empty transactions list)
    users[email] = {
        "firstName": data["firstName"],
        "lastName": data["lastName"],
        "password": data["password"],
        "transactions": []  
    }
    save_json(users_file, users)

    # Generate and store token
    token = generate_token(email)
    tokens[email] = token
    save_json(tokens_file, tokens)

    return jsonify({
        "message": "Success",
        "token": token,
        "redirect": "/home"
    }), 201

# Login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    users = load_json(users_file)
    tokens = load_json(tokens_file)  

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if email in users and users[email]["password"] == password:
        token = generate_token(email)
        tokens[email] = token
        save_json(tokens_file, tokens)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "redirect": "/home",
            "email": email,  
            "transactions": users[email].get("transactions", [])
        }), 200

    return jsonify({"error": "Invalid username or password"}), 401

# Logout
@app.route("/api/logout", methods=["POST"])
def logout():
    data = request.get_json()
    tokens = load_json(tokens_file)  

    token_value = data.get("token")
    email = next((k for k, v in tokens.items() if v == token_value), None)
    if email:
        del tokens[email]  
        save_json(tokens_file, tokens)  
    return jsonify({"redirect": "/"})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
