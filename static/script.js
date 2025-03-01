const apiConnect = "http://127.0.0.1:5000/budget";
const transactionApiConnect = "http://127.0.0.1:5001/transactions";

document.addEventListener("DOMContentLoaded", function () {
    var transactionTable = document.getElementById("transaction-table");
    var transactionBtn = document.getElementById("submit-transaction");
    var totalIncome = document.getElementById("income-total");
    var totalExpense = document.getElementById("expense-total");
    var balance = document.getElementById("balance-total");
    var budgetTable = document.getElementById("budget-table");
    var quickAddButtons = document.querySelectorAll(".quick-add-btn");
    var quickAddInput = document.getElementById("amount-add");
    var infoModal = document.getElementById("info-modal");
    var infoTooltip = document.querySelector(".info-tooltip");
    var closeInfoModal = document.getElementById("close-info-modal");
    var modal = document.getElementById("confirm-modal");
    var confirmBtn = document.getElementById("confirm-btn");
    var cancelBtn = document.getElementById("cancel-btn");
    var filterCategory = document.getElementById("filter-category");
    var filterDate = document.getElementById("filter-date");
    var filterType = document.getElementById("filter-type");
    var transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    var itemToDelete = null;
    var deleteType = "";

    function getUserEmail() {
        var user = JSON.parse(localStorage.getItem("loggedin"));
        if (user) {
            return user.email;
        } else {
            return null;
        }
    }

    function returnLoginPage() {
        var email = getUserEmail();
        if (email === null) {
            window.location.href = "/";
            return;
        }
        loadTransactions();
        loadBudget();
    }
    window.onload = returnLoginPage;

    // Info Modal Event Listeners
    if (infoTooltip) {
        infoTooltip.addEventListener("click", function () {
            infoModal.style.display = "block";
        });
    }
    
    if (closeInfoModal) {
        closeInfoModal.addEventListener("click", function () {
            infoModal.style.display = "none";
        });
    }

    window.addEventListener("click", function (event) {
        if (event.target === infoModal) {
            infoModal.style.display = "none";
        }
    });

    // Load Budget
    function loadBudget() {
        fetch(apiConnect)
            .then(response => response.json())
            .then(function (budgetItems) {
                var budgetTable = document.getElementById("budget-table");
                var budgetSummary = document.getElementById("budget-summary"); 

                while (budgetTable.firstChild) {
                    budgetTable.removeChild(budgetTable.firstChild);
                }
                while (budgetSummary.firstChild) {
                    budgetSummary.removeChild(budgetSummary.firstChild);
                }
    
                budgetItems.forEach(function (item) {
                    budgetTable.appendChild(createBudgetRow(item)); 
                    budgetSummary.appendChild(createBudgetItem(item)); 
                });
    
                updateProgressBars();
            })
    }
    
    function createBudgetRow(item) {
        var row = document.createElement("tr");
        row.setAttribute("data-id", item.id);
        row.appendChild(createCell(item.category));
        row.appendChild(createCell("$" + parseFloat(item.amount).toFixed(2)));

        var actionsCell = document.createElement("td");
        var deleteBtn = createButton("Delete", "delete-btn", function () {
            itemToDelete = row;
            deleteType = "budget";
            modal.style.display = "flex";
        });

        var editBtn = createButton("Edit", "edit-btn", function () {
            editBudget(row);
        });

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        return row;
    }

    function editBudget(row) {
        const cells = row.querySelectorAll("td");
        const editBtn = row.querySelector(".edit-btn");
    
        for (var i = 0; i < 2; i++) { 
            const cell = cells[i];
            const input = document.createElement("input");
            var value = cell.textContent;
            if (i === 1) { 
                value = value.replace('$', '');
            }
            input.value = value;
            cell.textContent = "";
            cell.appendChild(input);
        }
    
        editBtn.textContent = "Save";
        const newEditBtn = document.createElement("button");
        newEditBtn.textContent = "Save";
        newEditBtn.classList.add("edit-btn");
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        newEditBtn.addEventListener("click", function () {
            saveBudget(row);
        });
    }

    function saveBudget(row) {
        var budgetId = row.getAttribute("data-id");
        var cells = row.querySelectorAll("td");
    
        var updatedBudget = {
            category: cells[0].querySelector("input").value.trim(),
            amount: parseFloat(cells[1].querySelector("input").value),
        };
    
        if (!updatedBudget.category || isNaN(updatedBudget.amount) || updatedBudget.amount <= 0) {
            return;
        }
    
        fetch(apiConnect + "/" + budgetId, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedBudget),
        })
        .then(response => response.json())
        .then(() => {
            loadBudget(); 
        });
    }

    var addBudgetBtn = document.getElementById("add-category");
    
    if (addBudgetBtn) {
        addBudgetBtn.addEventListener("click", addBudget);
    }

    function addBudget() {
        var categoryInput = document.getElementById("budget-category");
        var amountInput = document.getElementById("allocation-amount");
        var category = categoryInput.value.trim();
        var amount = parseFloat(amountInput.value);

        if (!category || category === "" || isNaN(amount) || amount <= 0) {
            alert("Please select a valid category and enter a valid amount.");
            return;
        }

        var newBudget = {
            category: category,
            amount: amount,
            email: user.email 
        };

        fetch(apiConnect, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBudget),
        })
        .then(response => response.json())
        .then(data => {
            loadBudget(); 
            categoryInput.value = "";
            amountInput.value = "";
        })
        .catch(error => {
            console.error("Error adding budget:", error);
        });
    }

    function createBudgetItem(item) {
        var container = document.createElement("div");
        container.classList.add("budget-item");
        container.setAttribute("data-category", item.category);
        container.setAttribute("data-allocated", item.amount);
    
        var label = document.createElement("div");
        label.textContent = item.category;
        container.appendChild(label);
    
        var progressContainer = document.createElement("div");
        progressContainer.classList.add("progress-container");
        container.appendChild(progressContainer);
    
        return container;
    }
       
    
    function loadTransactions() {
        var email = getUserEmail();
        if (!email) return;
    
        fetch(transactionApiConnect + "?email=" + encodeURIComponent(email))
            .then(response => response.json())
            .then(function (data) {
                transactions = data;
                showTransactions(transactions);
                updateSummary(transactions);
                updateProgressBars();
            });
    }       

    function showTransactions(transactions) {
        while (transactionTable.firstChild) {
            transactionTable.removeChild(transactionTable.firstChild);
        }
    
        transactions.forEach(function (transaction) {
            transactionTable.appendChild(createTransactionRow(transaction));
        });
    }
    

    function createTransactionRow(transaction) {
        var row = document.createElement("tr");
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
    
        var actionsCell = document.createElement("td");
    
        var editBtn = createButton("Edit", "edit-btn", function () {
            editTransaction(row);
        });
    
        var deleteBtn = createButton("Delete", "delete-btn", function () {
            deleteTransaction(transaction.id);
        });
    
        actionsCell.appendChild(editBtn); 
        actionsCell.appendChild(deleteBtn); 
        row.appendChild(actionsCell);
        
        return row;
    }
    

    if (confirmBtn) {
        confirmBtn.addEventListener("click", function () {
            if (!itemToDelete) return;
    
            var itemId = itemToDelete.getAttribute("data-id");
            var apiURL = deleteType === "budget" ? `${apiConnect}/${itemId}` : `${transactionApiConnect}/${itemId}`;
    
            fetch(apiURL, { method: "DELETE" })
                .then(response => response.json())
                .then(function () {
                    itemToDelete.remove();
                    modal.style.display = "none";
                    itemToDelete = null;
                    if (deleteType === "budget") {
                        loadBudget();
                    } else {
                        loadTransactions();
                    }
                });
        });
    }    

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            itemToDelete = null;
            modal.style.display = "none";
        });
    }

    // Progress bar for transactions and budget comparison
    function updateProgressBars() {
        var budgetData = document.getElementById("budget-summary");
        if (!budgetData) return;
    
        var budgetItems = budgetData.querySelectorAll(".budget-item");
        budgetItems.forEach(function (container) {
            var label = container.querySelector("div:first-child");
            if (!label) return;
    
            var category = label.textContent.trim();
            var allocatedAmount = parseFloat(container.getAttribute("data-allocated"));
            var spentAmount = 0;
    
            if (isNaN(allocatedAmount) || allocatedAmount <= 0) {
                return;
            }
    
            transactions.forEach(function (transaction) {
                if (transaction.type.toLowerCase() === "expense" && transaction.category.trim().toLowerCase() === category.toLowerCase()) {
                    spentAmount += parseFloat(transaction.amount);
                }
            });
    
            var percentage = (spentAmount / allocatedAmount) * 100;
            if (percentage > 100) {
                percentage = 100;
            }
            if (percentage < 0) {
                percentage = 0;
            }
    
            var progressContainer = container.querySelector(".progress-container");
            if (!progressContainer) {
                progressContainer = document.createElement("div");
                progressContainer.classList.add("progress-container");
                container.appendChild(progressContainer);
            }
    
            var progressBar = progressContainer.querySelector(".progress-bar");
            if (!progressBar) {
                progressBar = document.createElement("div");
                progressBar.classList.add("progress-bar");
                progressContainer.appendChild(progressBar);
            }
    
            progressBar.style.width = percentage + "%";
    
            progressBar.className = "progress-bar";
            if (percentage < 50) {
                progressBar.classList.add("low");
            } else if (percentage < 100) {
                progressBar.classList.add("medium");
            } else {
                progressBar.classList.add("high");
            }
        });
    }      
    
    function addTransaction() {
        var email = getUserEmail();
        if (!email) {
            alert("User not logged in.");
            return;
        }
    
        var type = document.getElementById("type").value;
        var valueAmount = document.getElementById("amount").value; 
        var category = document.getElementById("expense-category").value;
        var itemName = document.getElementById("item-name").value;
        var date = document.getElementById("date").value;
    
        if (!type || isNaN(valueAmount) || !category || !itemName || !date) {
            alert("All fields are required.");
            return;
        }
    
        fetch(transactionApiConnect, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTransaction)
        })
        .then(response => response.json())
        .then(function (transaction) {
            if (!transaction.id) {
                alert("Error adding transaction");
                return;
            }
            transactionTable.appendChild(createTransactionRow(transaction));
            updateSummary();
            updateProgressBars();
        })
    }
    

    if (transactionBtn) {
        transactionBtn.addEventListener("click", addTransaction);
    }

    function deleteTransaction(transactionId) {
        var email = getUserEmail();
        if (!email) {
            alert("User email is missing.");
            return;
        }
    
        fetch(`${transactionApiConnect}/${transactionId}?email=${encodeURIComponent(email)}`, {
            method: "DELETE",
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to delete transaction");
            }
            return response.json();
        })
        .then(() => {
            loadTransactions();  
            updateProgressBars();
        })
    }
    

    // Edit transaction
    function editTransaction(row) {
        var cells = row.querySelectorAll("td");
        var editBtn = row.querySelector(".edit-btn");
    
        if (!editBtn) {
            return;
        }
    
        for (var i = 0; i < 5; i++) {
            const cell = cells[i];
            const existingText = cell.textContent.trim();
            const input = document.createElement("input");
    
            if (i === 1) {
                input.value = existingText.replace('$', '');
            } else {
                input.value = existingText;
            }
    
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
    
            cell.appendChild(input);
        }

        var saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.className = "save-btn";
        editBtn.parentNode.replaceChild(saveBtn, editBtn);
        saveBtn.addEventListener("click", function () {
            saveTransaction(row);
        });
    }
    
    
    

    function saveTransaction(row) {
        var transactionId = row.getAttribute("data-id");
        var cells = row.querySelectorAll("td");
    
        var type = cells[0].querySelector("input").value.trim();
        var amount = parseFloat(cells[1].querySelector("input").value);
        var category = cells[2].querySelector("input").value.trim();
        var itemName = cells[3].querySelector("input").value.trim();
        var date = cells[4].querySelector("input").value.trim();
    
        var user = JSON.parse(localStorage.getItem("loggedin"));
        var email = user ? user.email : null;
    
        if (!email) {
            return;
        }
    
        if (!type || isNaN(amount) || amount <= 0 || !category || !itemName || !date) {
            return;
        }
    
        const updatedTransaction = {
            type: type,
            amount: amount,
            category: category,
            itemName: itemName,
            date: date,
            email: email
        };
    
        fetch(`${transactionApiConnect}/${transactionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTransaction),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update transaction");
            }
            return response.json();
        })
        .then(() => {
            loadTransactions(); 
        })
    }
    
    
    
    function createButton(text, className, onClick) {
        var button = document.createElement("button");
        button.textContent = text;
        button.className = className;
        button.addEventListener("click", onClick);
        return button;
    }    

    function filterTransactions() {
        var rows = document.querySelectorAll("tr.transaction-row");
        var category = filterCategory.value;
        var date = filterDate.value;
        var type = filterType.value.toLowerCase();

        rows.forEach(function (row) {
            var rowCategory = row.getAttribute("data-category");
            var rowDate = row.getAttribute("data-date");
            var rowType = row.getAttribute("data-type");

            if (
                (category === "All" || rowCategory === category) &&
                (date === "" || rowDate === date) &&
                (type === "select" || rowType === type)
            ) {
                row.style.display = "table-row";
            } else {
                row.style.display = "none";
            }
        });
    }

    if (filterCategory && filterDate && filterType) {
        filterCategory.addEventListener("change", filterTransactions);
        filterDate.addEventListener("change", filterTransactions);
        filterType.addEventListener("change", filterTransactions);
    }

    function createCell(text) {
        var cell = document.createElement("td");
        cell.textContent = text;
        return cell;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Quick Add Transaction
    function handleQuickAdd(event) {
        var email = getUserEmail();
        if (!email) {
            alert("User not logged in.");
            return;
        }

        var valueAmount = parseFloat(quickAddInput.value);
        if (!valueAmount || isNaN(valueAmount) || valueAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        var date = new Date().toISOString().split("T")[0];
        var button = event.currentTarget;
        var category = button.getAttribute("data-category");
        var transactionType = "expense";

        if (button.textContent.trim().toLowerCase() === "salary") {
            transactionType = "income";
            category = "N/A";
        }

        var newTransaction = {
            type: transactionType,
            amount: valueAmount,
            category: category,
            itemName: "N/A",
            date: date,
            email: email
        };

        fetch(transactionApiConnect, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTransaction)
        })
            .then(response => response.json())
            .then(function () {
                quickAddInput.value = "";
                loadTransactions();
            });
    }

    quickAddButtons.forEach(function (btn) {
        btn.addEventListener("click", handleQuickAdd);
    });

    if (transactionBtn) {
        transactionBtn.addEventListener('click', addTransaction);
    }

    function updateSummary(transactions) {
        if (!Array.isArray(transactions)) {
            console.error("Invalid transactions data:", transactions);
            return;
        }
    
        var income = 0, expense = 0;
        transactions.forEach(transaction => {
            var amt = parseFloat(transaction.amount);
            if (!isNaN(amt)) {
                if (transaction.type.toLowerCase() === "income") {
                    income += amt;
                } else {
                    expense += amt;
                }
            }
        });
    
        totalIncome.textContent = "$" + income.toFixed(2);
        totalExpense.textContent = "$" + expense.toFixed(2);
        balance.textContent = "$" + (income - expense).toFixed(2);
    }
    var logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedin");
        window.location.href = "/";
    }
    
    loadBudget();
    loadTransactions();
    updateProgressBars();
});
