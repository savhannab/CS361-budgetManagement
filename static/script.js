const apiConnect = "http://127.0.0.1:5000/budget";
const transactionApiConnect = "http://127.0.0.1:5001/transactions";

document.addEventListener('DOMContentLoaded', function() {
    var transactionTable = document.getElementById('transaction-table');
    var transactionBtn = document.getElementById('submit-transaction');
    var totalIncome = document.getElementById('income-total');
    var totalExpense = document.getElementById('expense-total');
    var balance = document.getElementById('balance-total');
    var infoTooltip = document.querySelector('.info-tooltip');
    var infoModal = document.getElementById('info-modal');
    var closeInfoModal = document.getElementById('close-info-modal');
    var addCategoryBtn = document.getElementById("add-category");
    var budgetTable = document.getElementById("budget-table");
    var quickAddButtons = document.querySelectorAll('.quick-add-btn');
    var quickAddInput = document.getElementById('amount-add');
    var transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedin'));
    
    // Budget Microservice
    function loadBudget() {
        fetch(apiConnect)
        .then(response => response.json())
        .then(budgetItems => {
            while (budgetTable.firstChild) {
                budgetTable.removeChild(budgetTable.firstChild);
            }
            budgetItems.forEach(item => budgetTable.appendChild(createBudgetRow(item)));
        })
    }

    // Creates row for budget item to be added
    function createBudgetRow(item) {
      var row = document.createElement("tr");
      row.setAttribute("data-id", item.id);
      var categoryCell = document.createElement("td");
      categoryCell.textContent = item.category;
      row.appendChild(categoryCell);
      var amountCell = document.createElement("td");
      amountCell.textContent = `$${item.amount.toFixed(2)}`;
      row.appendChild(amountCell);
  
      var actionsCell = document.createElement("td");
      var editBtn = createButton("Edit", "edit-btn", function () {
          editBudgetItem(item.id, row);
      });
      var deleteBtn = createButton("Delete", "delete-btn", function () {
          deleteBudgetItem(item.id, row);
      });
      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(deleteBtn);
      row.appendChild(actionsCell);
      return row; 
  }

    var budgInput = document.getElementById('budget-category');
    var allocInput = document.getElementById('allocation-amount');
    if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", function () {
        var category = budgInput.value;
        var amount = parseFloat(allocInput.value);
        var addItem = { category, amount };
        if (!category || isNaN(amount) || amount <= 0) {
            alert("Enter a valid category and amount.");
            return;
        }
        fetch(apiConnect, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(addItem),
        })
            .then(response => response.json())
            .then(data => {
                budgetTable.appendChild(createBudgetRow(data));
                budgInput.value = "";
                allocInput.value = "";
            })
    });
  }

    // Edit budget item
    function budgetEdit(button) {
      const row = button.closest("tr");
    if (!row) return;

    const budgetId = row.getAttribute("data-id");
    const values = row.querySelectorAll("td");

    if (button.textContent === "Edit") {
        const fields = ["category", "amount"];
        for (let i = 0; i < fields.length; i++) {
            const text = values[i].textContent.replace("$", "").trim();
            const input = document.createElement("input");

            input.value = text;
            input.name = fields[i];
            values[i].textContent = "";
            values[i].appendChild(input);
        }
        button.textContent = "Save";
    } else {
        const updatedBudgetItem = {
            category: values[0].querySelector("input").value,
            amount: parseFloat(values[1].querySelector("input").value)
        };

        fetch(`${apiConnect}/${budgetId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedBudgetItem)
        })
        .then(response => response.json())
        .then(() => {
            loadBudget();
        })
    }
  }

    // Delete budget item
    function budgetDelete(button) {
      const row = button.closest("tr");
      if (!row) return;

      const budgetId = row.getAttribute("data-id");

      if (confirm("Are you sure you want to delete this item?")) {
          fetch(`${apiConnect}/${budgetId}`, {
              method: "DELETE"
          })
          .then(() => {
              loadBudget(); 
          })
      }
    }

    document.addEventListener("click", function (event) {
      const button = event.target;
  
      if (button.classList.contains("edit-btn") && button.closest("#budget-table")) {
          budgetEdit(button);
      }
  
      if (button.classList.contains("delete-btn") && button.closest("#budget-table")) {
          budgetDelete(button);
      }
    });
  
    function createButton(text, className, onClick) {
        var button = document.createElement("button");
        button.textContent = text;
        button.className = className;
        button.addEventListener("click", onClick);
        return button;
    }

    // Progress bar comparing budget items with transactions and displaying reults
    function createProgressBar(allocated, category) {
        var spent = 0;
        var percent = 0;
        if (Array.isArray(transactions)) {
          spent = 0;
          for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].type.toLowerCase() === 'expense' && transactions[i].category === category) {
              spent += parseFloat(transactions[i].amount);
            }
          }
        }        
        if (allocated > 0) {
          percent = (spent / allocated) * 100;
        }
        if (percent > 100) {
          percent = 100;
        }
        var container = document.createElement("div");
        container.classList.add("progress-container");
        var bar = document.createElement("div");
        bar.classList.add("progress-bar");
        if (percent < 40) {
          bar.classList.add('low');
        } else if (percent < 70) {
          bar.classList.add('medium');
        } else {
          bar.classList.add('high');
        }
        bar.style.width = percent + "%";
        container.appendChild(bar);
        return container;
    }
       
    //fetch data for progress bar
    fetch(apiConnect)
    .then(response => response.json())
    .then(budgetItems => {
        var budgetData = document.getElementById("budget-summary");
        while (budgetData.firstChild) {
        budgetData.removeChild(budgetData.firstChild);
        }
        budgetItems.forEach(item => {
        var container = document.createElement("div");
        container.classList.add("budget-item");
        
        var label = document.createElement("div");
        label.textContent = item.category;
        container.appendChild(label);
        var progress = createProgressBar(parseFloat(item.amount), item.category);
        container.appendChild(progress);
        
        budgetData.appendChild(container);
        });
    })


    function updateProgressBars() {
        const budgetData = document.getElementById("budget-summary");
        Array.from(budgetData.children).forEach(container => {
            const label = container.querySelector("div:first-child");
            if (!label) return;
            const category = label.textContent.trim();
            const allocatedAmount = parseFloat(container.getAttribute("data-allocated")) || 0;
            const progress = createProgressBar(allocatedAmount, category);
            const oldProgress = container.querySelector(".progress-container");
            if (oldProgress) container.removeChild(oldProgress);
            container.appendChild(progress);
        });
    }
    
   // Fetch budget data for progress bars
    fetch(apiConnect)
    .then(response => response.json())
    .then(budgetItems => {
        const budgetData = document.getElementById("budget-summary");
        if (!budgetData) {
            return;
        }

        while (budgetData.firstChild) {
            budgetData.removeChild(budgetData.firstChild);
        }
        budgetItems.forEach(item => {
            const container = document.createElement("div");
            container.classList.add("budget-item");
            const label = document.createElement("div");
            label.textContent = item.category;
            container.appendChild(label);
            container.setAttribute("data-allocated", parseFloat(item.amount));
            const progress = document.createElement("div");
            progress.classList.add("progress-container");
            container.appendChild(progress);

            budgetData.appendChild(container);
        });
        updateProgressBars();
    })
        function loadBudget() {
        fetch(apiConnect)
            .then(response => response.json())
            .then(budgetItems => {
                while (budgetTable.firstChild) {
                    budgetTable.removeChild(budgetTable.firstChild);
                }
                budgetItems.forEach(item => budgetTable.appendChild(createBudgetRow(item)));
            })
    }

    //Info modal
    infoTooltip.addEventListener('click', function() {
      infoModal.style.display = 'block';
    });
  
    closeInfoModal.addEventListener('click', function() {
      infoModal.style.display = 'none';
    });
  
    window.addEventListener('click', function(event) {
      if (event.target === infoModal) {
        infoModal.style.display = 'none';
      }
    });
  
      //Log out
    document.getElementById('logout-btn').addEventListener('click', function() {
      localStorage.removeItem('loggedin');
      window.location.href = 'login.html';
    });
  
    if (loggedInUser && loggedInUser.firstName) {
      document.getElementById('first-name').textContent = loggedInUser.firstName;
    } else {
      document.getElementById('first-name').textContent = 'Guest'; 
    }

    function createCell(text) {
        const cell = document.createElement('td');
        cell.textContent = text;
        return cell;
    }

    // Transactions Microservice
    function loadTransactions() {
        fetch(transactionApiConnect)
            .then(response => response.json())
            .then(data => {
                transactions = data.transactions || data; 
                showTransactions(transactions);
                updateSummary(transactions);
                setTimeout(updateProgressBars, 500);
            })
    }
    
    function showTransactions(responseData) {
        const transactions = responseData.transactions || responseData;
        if (!Array.isArray(transactions)) {
            return;
        }
    
        while (transactionTable.firstChild) {
            transactionTable.removeChild(transactionTable.firstChild);
        }
    
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.classList.add("transaction-row");
            row.setAttribute("data-id", transaction.id);
            row.setAttribute("data-type", transaction.type.toLowerCase());
            row.setAttribute("data-category", transaction.category);
            row.setAttribute("data-date", transaction.date);
            row.appendChild(createCell(capitalize(transaction.type)));
            row.appendChild(createCell("$" + parseFloat(transaction.amount).toFixed(2)));
            row.appendChild(createCell(transaction.category));
            row.appendChild(createCell(transaction.itemName));
            row.appendChild(createCell(transaction.date));
            const actionsCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = "Edit";
            editBtn.classList.add("edit-btn");
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("delete-btn");
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            row.appendChild(actionsCell);
            transactionTable.appendChild(row);
        });
    }
    
    // Add transaction
    function addTransaction() {
        const type = getValue('type');
        const amountStr = getValue('amount');
        const amount = parseFloat(amountStr);
        const category = getValue('expense-category');
        const itemName = getValue('item-name');
        const date = getValue('date');
        const newTransaction = { type, amount, category, itemName, date };

        if (!type || isNaN(amount) || !category || !itemName || !date) {
            alert("All fields are required and must be valid.");
            return;
        }

        fetch(transactionApiConnect, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTransaction)
        })
        .then(response => response.json())
        .then(() => {
            loadTransactions();
            clearForm(['type', 'amount', 'expense-category', 'item-name', 'date']);
        })
    }

    // Delete transaction
    function deleteTransaction(transactionId) {
        fetch(`${transactionApiConnect}/${transactionId}`, {
            method: "DELETE"
        })
        .then(response => {
            return response.json();
        })
        .then(() => loadTransactions())
   }
   

    // Edit transaction
    function editTransaction(row) {
        const cells = row.querySelectorAll('td');
        const editBtn = row.querySelector('.edit-btn');
        for (let i = 0; i < 5; i++) {
            const cell = cells[i];
            const input = document.createElement('input');
            let value = cell.textContent;
            if (i === 1) {
                value = value.replace('$', '');
            }
            input.value = value;
            cell.textContent = "";
            cell.appendChild(input);
        }
        editBtn.textContent = "Save";
    }

    // Save transaction
    function saveTransaction(row) {
        if (!row) return;
    
        const transactionId = row.getAttribute('data-id');
        if (!transactionId) {
            alert("Transaction ID not found. Unable to update.");
            return;
        }
    
        const cells = row.querySelectorAll('td');
        const updatedTransaction = {
            type: cells[0].querySelector('input').value.trim(),
            amount: parseFloat(cells[1].querySelector('input').value),
            category: cells[2].querySelector('input').value.trim(),
            itemName: cells[3].querySelector('input').value.trim(),
            date: cells[4].querySelector('input').value
        };
   
        fetch(`${transactionApiConnect}/${transactionId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(updatedTransaction)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || "Failed to update transaction");
                });
            }
            return response.json();
        })
        .then(() => {
            loadTransactions(); 
        })
    }
   
    // Income, expense, and balance summary 
    function updateSummary(transactions) {
        let income = 0, expense = 0;
        transactions.forEach(transaction => {
            const amt = parseFloat(transaction.amount);
            if (transaction.type.toLowerCase() === "income") {
                income += amt;
            } else {
                expense += amt;
            }
        });
        totalIncome.textContent = "$" + income.toFixed(2);
        totalExpense.textContent = "$" + expense.toFixed(2);
        const balanceVal = income - expense;
        balance.textContent = "$" + balanceVal.toFixed(2);
        if (balanceVal >= 0) {
            balance.classList.remove("negative");
            balance.classList.add("positive");
        } else {
            balance.classList.remove("positive");
            balance.classList.add("negative");
        }
    }

    transactionTable.addEventListener('click', function(event) {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        if (target.classList.contains('delete-btn')) {
            const transactionId = row.getAttribute('data-id');
            if (confirm("Are you sure you want to delete this transaction?")) {
                deleteTransaction(transactionId);
            }
        }

        if (target.classList.contains('edit-btn')) {
            if (target.textContent === "Edit") {
                editTransaction(row);
            } else if (target.textContent === "Save") {
                saveTransaction(row);
            }
        }
    });

    function getValue(id) {
        return document.getElementById(id).value;
    }

    function clearForm(ids) {
        ids.forEach(id => {
            document.getElementById(id).value = "";
        });
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    if (transactionBtn) {
        transactionBtn.addEventListener('click', addTransaction);
    }
    loadTransactions();
  
    // Summary of income, expenses, and balance
    function updateSummary(responseData) {
        const transactions = responseData.transactions || responseData; 
    
        if (!Array.isArray(transactions)) {
            return;
        }
    
        let income = 0, expense = 0;
    
        transactions.forEach(transaction => {
            const amt = parseFloat(transaction.amount);
            if (transaction.type.toLowerCase() === "income") {
                income += amt;
            } else {
                expense += amt;
            }
        });
    
        totalIncome.textContent = "$" + income.toFixed(2);
        totalExpense.textContent = "$" + expense.toFixed(2);
        const balanceVal = income - expense;
        balance.textContent = "$" + balanceVal.toFixed(2);
    
        if (balanceVal >= 0) {
            balance.classList.remove("negative");
            balance.classList.add("positive");
        } else {
            balance.classList.remove("positive");
            balance.classList.add("negative");
        }
    }
    
    if (
      document.getElementById('filter-category') &&
      document.getElementById('filter-date') &&
      document.getElementById('filter-type')
    ) {
      const filterCategory = document.getElementById('filter-category');
      const filterDate = document.getElementById('filter-date');
      const filterType = document.getElementById('filter-type'); 
      filterCategory.addEventListener('change', filterTransactions);
      filterDate.addEventListener('change', filterTransactions);
      filterType.addEventListener('change', filterTransactions);
    }
    
    // Filter transactions by type, category, date
    function filterTransactions() {
      const rows = document.querySelectorAll("tr.transaction-row");
      const filterCategory = document.getElementById('filter-category').value;
      const filterDate = document.getElementById('filter-date').value;
      const filterType = document.getElementById('filter-type').value.toLowerCase();
    
      rows.forEach(row => {
        const transactionCategory = row.getAttribute("data-category");
        const transactionDate = row.getAttribute("data-date");
        const transactionType = row.getAttribute("data-type");
    
        const categoryMatch = filterCategory === "All" || transactionCategory === filterCategory;
        const dateMatch = !filterDate || transactionDate === filterDate;
        const typeMatch = filterType === "select" || transactionType === filterType;
    
        row.style.display = (categoryMatch && dateMatch && typeMatch) ? "table-row" : "none";
      });
    }
    
    // Quick add Salary, Housing, and Food after amount input is added
    function handleQuickAdd(event) {
        const valueAmount = parseFloat(quickAddInput.value);
        if (!valueAmount || isNaN(valueAmount) || valueAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
   
        const date = new Date().toISOString().split('T')[0];
        const button = event.currentTarget;
        const btnCategory = button.getAttribute('data-category');
   
        let transactionType, category, itemName;
        if (button.textContent.trim().toLowerCase() === 'salary') {
            transactionType = "income";
            category = "N/A";
            itemName = "Salary";
        } else {
            transactionType = "expense";
            category = btnCategory;
            itemName = "N/A";
        }
   
        const newTransaction = {
            type: transactionType,
            amount: valueAmount,
            category: category,
            itemName: itemName,
            date: date
        };
   
        fetch(transactionApiConnect, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(newTransaction)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || "Failed to add transaction");
                });
            }
            return response.json();
        })
        .then(() => {
            quickAddInput.value = ''; 
            loadTransactions(); 
        })
   }
    
  if (transactionBtn) {
      transactionBtn.addEventListener('click', addTransaction);
  }
  quickAddButtons.forEach(function(btn) {
      btn.addEventListener('click', handleQuickAdd);
  });
    loadBudget();
    loadTransactions();
});
