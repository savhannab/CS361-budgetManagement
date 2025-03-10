document.addEventListener("DOMContentLoaded", function () {
    var transactionTable = document.getElementById("transaction-table");
    var transactionBtn = document.getElementById("submit-transaction");
    var totalIncome = document.getElementById("income-total");
    var totalExpense = document.getElementById("expense-total");
    var balance = document.getElementById("balance-total");
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
    var checkLogin = false;
    var checkBudget = false;
    var checkTransactions = false;

        // Info about page functionality and purpose
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

    //**************************************************************************
    // Login
    //**************************************************************************
    
    function getUserEmail() {
        var user = JSON.parse(localStorage.getItem("loggedin"));
        if (user) {
            return user.email;
        } else {
            return null;
        }
    }

    function returnLoginPage() {
        if (checkLogin) return;
        checkLogin = true; 
        var email = getUserEmail();
    
        if (!email) {
            if (!sessionStorage.getItem("redirected")) {  
                sessionStorage.setItem("redirected", "true");
                window.location.href = "/";
            }
            return;
        }
    
        if (!checkBudget) {
            checkBudget = true;
            loadBudget();
        }
    
        if (!checkTransactions) {
            checkTransactions = true;
            loadTransactions();
        }
    }
    window.onload = returnLoginPage;    

    // Switch between login & signup forms
    document.getElementById("signing-up")?.addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".selection.active").classList.remove("active");
        this.parentElement.classList.add("active");
        document.getElementById("signup").style.display = "block";
        document.getElementById("login").style.display = "none";
    });

    document.getElementById("logging-in")?.addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".selection.active").classList.remove("active");
        this.parentElement.classList.add("active");
        document.getElementById("login").style.display = "block";
        document.getElementById("signup").style.display = "none";
        attachLoginListener();
    });

    // Password visibility
    document.querySelectorAll(".password-view-icon").forEach(icon => {
        icon.addEventListener("click", function () {
            const input = this.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
            this.querySelector("i").classList.toggle("fa-eye");
            this.querySelector("i").classList.toggle("fa-eye-slash");
        });
    });

    // Signup
    document.getElementById("signup-form")?.addEventListener("submit", function (event) {
        event.preventDefault();

        const firstName = document.getElementById("first-name").value.trim();
        const lastName = document.getElementById("last-name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const errorElement = document.getElementById("confirm-error");

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            errorElement.textContent = "All fields are required.";
            errorElement.style.color = "red";
            errorElement.style.display = "block";
            return;
        }

        if (password !== confirmPassword) {
            errorElement.textContent = "Passwords do not match.";
            errorElement.style.display = "block";
            errorElement.style.color = "red";
            return;
        }

        fetch(`/login/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, password, confirmPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                errorElement.textContent = data.error;
                errorElement.style.display = "block";
            } else {
                localStorage.setItem("token", data.token);
                localStorage.setItem("loggedin", JSON.stringify({ email }));
                window.location.href = "/home";
            }
        })
        .catch(error => {
            console.error("Signup Error:", error);
        });
    });


    // Login
    function attachLoginListener() {
        const loginForm = document.getElementById("login-form");
        if (!loginForm || loginForm.dataset.listener === "true") return;
        
        loginForm.dataset.listener = "true"; 
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            loginUser();
        });
    }

    function loginUser() {
        const emailInput = document.getElementById("login-email");
        const passwordInput = document.getElementById("login-password");
        const errorElement = document.getElementById("login-error");
    
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
    
        if (!email || !password) {
            errorElement.textContent = "All fields required.";
            errorElement.style.color = "red";
            errorElement.style.display = "block";
            return;
        }
    
        fetch(`login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                errorElement.textContent = data.error;
                errorElement.style.display = "block";
                errorElement.style.color = "red"; 
            } else {
                localStorage.setItem("token", data.token);
                localStorage.setItem("loggedin", JSON.stringify({ email }));
                checkLogin = true;
                checkBudget = true;
                checkTransactions = true;
                window.location.href = data.redirect;
            }
        })
    }

    //**************************************************************************
    // Budget 
    //**************************************************************************

    function loadBudget() {
        fetch("/budget")
            .then(response => response.json())
            .then(function (budgetItems) {
                var budgetTable = document.getElementById("budget-table");
                var budgetSummary = document.getElementById("budget-summary"); 

                if (!budgetTable || !budgetSummary) {
                    return;
                }
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
    
    //Creates row for category, amount, edit and delete button for budget
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

    // Saves the edited budget item
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
    
        fetch("http://127.0.0.1:5002/budget/" + budgetId, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedBudget),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`Failed to update budget: ${text}`); });
            }
            return response.json();
        })
        .then(data => {
            console.log("Budget updated:", data);
            loadBudget(); 
        })
        .catch(error => {
            console.error("Error updating budget:", error);
        });
    }
    
    var addBudgetBtn = document.getElementById("add-category");
    if (addBudgetBtn) {
        addBudgetBtn.addEventListener("click", addBudget);
    }

    // Add buget item by adding category and amount, for specific user and store in json file 
    function addBudget() {
        var categoryInput = document.getElementById("budget-category");
        var amountInput = document.getElementById("allocation-amount");
        var category = categoryInput.value.trim();
        var amount = parseFloat(amountInput.value);
        var email = getUserEmail();

        if (!category || category === "" || isNaN(amount) || amount <= 0) {
            alert("All fields required");
            return;
        }

        var newBudget = {
            category: category,
            amount: amount,
            email: email 
        };

        fetch("http://127.0.0.1:5002/budget", {
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

    function deleteBudgetItem(budgetItem) {
        if (!budgetItem || !(budgetItem instanceof HTMLElement)) {
            console.error("Invalid budget item:", budgetItem);
            return;
        }
    
        var budgetId = budgetItem.getAttribute("data-id");
    
        if (!budgetId) {
            console.error("Budget ID is missing!");
            return;
        }
    
        var link = `http://127.0.0.1:5002/budget/${budgetId}`;
    
        fetch(link, {
            method: "DELETE"
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`Failed to delete budget item: ${text}`); });
            }
            return response.json();
        })
        .then(() => {
            loadBudget();
        })
        .catch(error => console.error("Delete error:", error));
    }

    //**************************************************************************
    // Transactions 
    //**************************************************************************

    // Summary of income, expenses, balance
    function updateSummary(transactions) {
    
        if (!Array.isArray(transactions) || transactions.length === 0) {
            console.error("Transactions data is undefined or invalid:", transactions);
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

        if ( !totalIncome || !totalExpense || !balance) {
            return;
        }
    
        totalIncome.textContent = "$" + income.toFixed(2);
        totalExpense.textContent = "$" + expense.toFixed(2);
        balance.textContent = "$" + (income - expense).toFixed(2);
    }

    function loadTransactions() {
        var email = getUserEmail(); 
        if (!email) {
            return;
        }
    
        fetch(`http://127.0.0.1:5003/transactions?email=${encodeURIComponent(email)}`, { 
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                transactions = data;
                showTransactions(transactions); 
                updateSummary(transactions);  
                updateProgressBars();
                localStorage.setItem("transactions", JSON.stringify(transactions)); 
            } 
        })
    }
    
    function showTransactions(transactions) {
        if (!transactionTable) {
            return;
        }
        while (transactionTable.firstChild) {
            transactionTable.removeChild(transactionTable.firstChild);
        }
    
        transactions.forEach(function (transaction) {
            transactionTable.appendChild(createTransactionRow(transaction));
        });
    }
    
    // Row containing id, type, category, date, name, edit and delete button
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
            itemToDelete = transaction.id; 
            deleteType = "transaction"; 
            modal.style.display = "flex"; 
        });
    
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        
        return row;
    }

    if (confirmBtn) {
        confirmBtn.addEventListener("click", function () {
            if (!itemToDelete) return;
    
            if (deleteType === "transaction") {
                deleteTransaction(itemToDelete);
            } else if (deleteType === "budget") {
                deleteBudgetItem(itemToDelete);
            }
    
            modal.style.display = "none"; 
            itemToDelete = null;
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            itemToDelete = null; 
            modal.style.display = "none"; 
        });
    }
      
    
    function addTransaction() {
        var email = getUserEmail();
        if (!email) {
            return;
        }
    
        var type = document.getElementById("type").value.trim();
        var valueAmount = parseFloat(document.getElementById("amount").value);
        var category = document.getElementById("expense-category").value.trim();
        var itemName = document.getElementById("item-name").value.trim();
        var date = document.getElementById("date").value.trim();
    
        if (!type || !valueAmount || !category || !itemName || !date) {
            return;
        }
    
        var newTransaction = {
            type: type,
            amount: valueAmount,
            category: category,
            itemName: itemName,
            date: date,
            email: email
        };
    
        fetch("http://127.0.0.1:5003/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTransaction)
        })
        .then(response => response.json())
        .then(data => {
            clearFormFields();
            loadTransactions();  
        });
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
    
    // Save edited transaction
    function saveTransaction(row) {
        var transactionId = row.getAttribute("data-id");
        var cells = row.querySelectorAll("td");
    
        var updatedTransaction = {
            id: transactionId,
            type: cells[0].querySelector("input").value.trim(),
            amount: parseFloat(cells[1].querySelector("input").value),
            category: cells[2].querySelector("input").value.trim(),
            itemName: cells[3].querySelector("input").value.trim(),
            date: cells[4].querySelector("input").value.trim(),
            email: getUserEmail() 
        };
    
        fetch(`http://127.0.0.1:5003/transactions/${updatedTransaction.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedTransaction)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Transaction updated successfully", data);
            loadTransactions(); 
        });
    }
    
    
    
    if (transactions.length > 0) {
        showTransactions(transactions);
        updateSummary(transactions);
        updateProgressBars();
    }
  
    // Delete transaction
    function deleteTransaction(transactionId) {
        var email = getUserEmail();  
        if (!email) {
            return;
        }
    
        fetch(`http://127.0.0.1:5003/transactions/${transactionId}?email=${encodeURIComponent(email)}`, {
            method: "DELETE",
        })
        
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log("Transaction deleted:", data.message);
                loadTransactions(); 
            } else {
                console.error("Error deleting transaction:", data.error);
            }
        })
        .catch(error => console.error("Error:", error));
    }
    
    function clearFormFields() {
        document.getElementById("type").value = ""; 
        document.getElementById("amount").value = ""; 
        document.getElementById("expense-category").value = ""; 
        document.getElementById("item-name").value = ""; 
        document.getElementById("date").value = ""; 
    }
               

    // Helper
    function createButton(text, className, onClick) {
        var button = document.createElement("button");
        button.textContent = text;
        button.className = className;
        button.addEventListener("click", onClick);
        return button;
    }    

    // Filter transactions by type, category, and/or date
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
            return;
        }
    
        var valueAmount = parseFloat(quickAddInput.value);
        if (!valueAmount || isNaN(valueAmount) || valueAmount <= 0) {
            alert("Invalid input");
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
    
        fetch("http://127.0.0.1:5003/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTransaction)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Quick Add Transaction added:", data);
            var transactionId = data.id;
    
            quickAddInput.value = "";
            loadTransactions();
            console.log("Transaction ID for editing:", transactionId);
        })
    }

    quickAddButtons.forEach(function (btn) {
        btn.addEventListener("click", handleQuickAdd);
    });

    if (transactionBtn) {
        transactionBtn.addEventListener('click', addTransaction);
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
    
    var logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedin");
        window.location.href = "/";
    }
    //**************************************************************************
    //Recommendation 
    //**************************************************************************

    const recommendationButton = document.getElementById("generate-recommendation");
    const recommendationOutput = document.getElementById("recommendation-output");
    var recommendHide = false;

    if (recommendationButton) {
        recommendationButton.addEventListener("click", function () {
            if (recommendHide) {
                hideRecommendations();
            } else {
                fetchRecommendations();
            }
        });
    } 

    // Retrieve recommendation
    function fetchRecommendations() {
        const income = parseFloat(document.getElementById("income-total").textContent.replace("$", "")) || 0;
        const expenses = parseFloat(document.getElementById("expense-total").textContent.replace("$", "")) || 0;
        const balance = parseFloat(document.getElementById("balance-total").textContent.replace("$", "")) || 0;
    
        fetch("/recommendation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ income, expenses, balance })
        })
        .then(response => response.json())
        .then(data => {
            if (data.recommendation) {
                showRecommendation(data.recommendation);
                recommendHide = true;
                recommendationButton.textContent = "Hide Recommendations";
            }
        });
    }
    
    function showRecommendation(recommendation) {
        clearRecommendations();
    
        const p = document.createElement("p");
        p.textContent = recommendation;
        p.style.fontWeight = "bold"; 
        recommendationOutput.appendChild(p);
        recommendationOutput.style.display = "block";
    }
    
    // Hide recommendation and change button to original setting
    function hideRecommendations() {
        clearRecommendations();
        recommendationOutput.style.display = "none";
        recommendationButton.textContent = "Generate Recommendations";
        recommendHide = false;
    }

    //Clear recommendation
    function clearRecommendations() {
        while (recommendationOutput.firstChild) {
            recommendationOutput.removeChild(recommendationOutput.firstChild);
        }
    }

    loadBudget();
    loadTransactions();
    updateProgressBars();
});
