from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# file to store budget data
BUDGET_FILE = 'budget_data.json'


# read json file
def load_budget_data():
    if os.path.exists(BUDGET_FILE):
        with open(BUDGET_FILE, 'r') as file:
            return json.load(file)
    # if no file, return empty array
    return []


# write to json file
def save_budget_data(data):
    with open(BUDGET_FILE, 'w') as file:
        json.dump(data, file, indent=2)


# sample data if no json file
if not os.path.exists(BUDGET_FILE):
    initial_data = [
        {
            'id': 1,
            'category': 'Rent',
            'amount': 1500.00,
            'spent': 0
        },
        {
            'id': 2,
            'category': 'Groceries',
            'amount': 300.00,
            'spent': 0
        }
    ]

    save_budget_data(initial_data)


# get current budget items
@app.route('/budget', methods=['GET'])
def get_budget():
    budget_items = load_budget_data()
    return jsonify(budget_items)


# add new budget item
@app.route('/budget', methods=['POST'])
def add_budget_item():
    budget_items = load_budget_data()
    new_item = request.get_json()

    # generate new ID (max curr ID + 1)
    max_id = max([item['id'] for item in budget_items], default=0)
    new_item['id'] = max_id + 1

    # initialize spent amount if not provided
    if 'spent' not in new_item:
        new_item['spent'] = 0

    budget_items.append(new_item)
    save_budget_data(budget_items)

    return jsonify(new_item), 201


# update selected budget item
@app.route('/budget/<int:item_id>', methods=['PUT'])
def update_budget_item(item_id):
    budget_items = load_budget_data()
    data = request.get_json()

    # find budget_item, update details
    for item in budget_items:
        if item['id'] == item_id:
            if 'category' in data:
                item['category'] = data['category']
            if 'amount' in data:
                item['amount'] = float(data['amount'])

            save_budget_data(budget_items)
            return jsonify(item)

    # if item not found, send error
    return jsonify({'Error: ', 'Item not found'}), 404


# delete selected budget item
@app.route('/budget/<int:item_id>', methods=['DELETE'])
def delete_budget_item(item_id):
    budget_items = load_budget_data()

    # find budget_item, delete and return
    for index, item in enumerate(budget_items):
        if item['id'] == item_id:
            deleted_item = budget_items.pop(index)
            save_budget_data(budget_items)
            return jsonify(deleted_item)

    # if item not found, send error
    return jsonify({'Error: ', 'Item not found'}), 404


if __name__ == '__main__':
    app.run(port=5002, debug=True)
