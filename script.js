const apiConnect = "http://127.0.0.1:5000/budget";

document.addEventListener('DOMContentLoaded', function() {
    var transactionbtn = document.getElementById('submit-transaction');
    var transactionTable = document.getElementById('transaction-table');
    var infoTooltip = document.querySelector('.info-tooltip');
    var infoModal = document.getElementById('info-modal');
    var closeInfoModal = document.getElementById('close-info-modal');
    var totalIncome = document.getElementById('income-total');
    var totalExpense = document.getElementById('expense-total');
    var balance = document.getElementById('balance-total');
    var deleteAccountBtn = document.getElementById('delete-account-btn');
    var addCategoryBtn = document.getElementById("add-category");
    var budgetTable = document.getElementById("budget-table");
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
        .catch(error => console.error("Error fetching budget:", error));
    }

    // Creates row for budget item to be added
    function createBudgetRow(item) {
        var row = document.createElement("tr");
        row.setAttribute("data-id", item.id);
        row.appendChild(addElement(item.category));
        row.appendChild(addElement(`$${item.amount.toFixed(2)}`));

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
            alert("Please enter a valid category and amount.");
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
            .catch(error => console.error("Error adding budget:", error));
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
        } else if (percent < 80) {
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
    .catch(error => console.error("Error fetching budget:", error)); 

    function loadBudget() {
      fetch(apiConnect)
          .then(response => response.json())
          .then(budgetItems => {
              while (budgetTable.firstChild) {
                  budgetTable.removeChild(budgetTable.firstChild);
              }
              budgetItems.forEach(item => budgetTable.appendChild(createBudgetRow(item)));
          })
          .catch(error => console.error("Error fetching budget:", error));
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
    
    // Show transactions
    function showTransactions() {
        while (transactionTable.firstChild) {
            transactionTable.removeChild(transactionTable.firstChild);
        }
        transactions.forEach(function(transaction, idx) {
            var row = createRow(transaction.type, transaction.amount, transaction.category, transaction.itemName, transaction.date);
            row.setAttribute('data-index', idx); 
            transactionTable.appendChild(row);
        });
        updateSummary(); 
    }
  
    window.addEventListener('load', showTransactions);
    showTransactions();
      
    if (transactionbtn) {
        transactionbtn.addEventListener('click', function() {
          addTransaction();
        });
    }
  
    // Add transactions
    function addTransaction() {
      var type = getValue('type');
      var amount = parseFloat(getValue('amount')).toFixed(2);
      var category = getValue('expense-category');
      var itemName = getValue('item-name');
      var date = getValue('date');
  
      if (!type || !amount || !category || !itemName || !date || isNaN(amount)) {
        alert('All fields required.');
        return;
      }
  
      transactions.push({ type, amount, category, itemName, date });
      saveTransactions();
      showTransactions(); 
      clearForm(['type', 'amount', 'expense-category', 'item-name', 'date']);
    }
  
    function createRow(type, amount, category, itemName, date) {
      var row = document.createElement('tr');
      var newElement = addElement('');
      var editBtn = createButton('Edit', 'edit-btn', row);
      var deleteBtn = createButton('Delete', 'delete-btn', row);
      row.classList.add('transaction-row'); 
      row.setAttribute('data-type', type.toLowerCase()); 
      row.setAttribute('data-category', category);
      row.setAttribute('data-date', date);
      row.appendChild(addElement(capitalize(type)));
      row.appendChild(addElement('$' + amount));
      row.appendChild(addElement(category));
      row.appendChild(addElement(itemName));
      row.appendChild(addElement(date));
  
  
      newElement.appendChild(editBtn);
      newElement.appendChild(deleteBtn);
      row.appendChild(newElement);
  
      return row;
    }
  
    // Helper
    function addElement(text) {
      var element = document.createElement('td');
      element.textContent = text;
      return element;
    }
  
    // Edit/ save/ delete/ delete account buttons for transactions
    function createButton(text, className) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        
        button.addEventListener('click', (event) => {
          const row = event.currentTarget.closest('tr');
          if (!row) return; 
          
          const idx = parseInt(row.getAttribute('data-index'));
          if (isNaN(idx)) return; 

          if (text === 'Delete') {
            confirm(() => {
              transactions.splice(idx, 1);
              saveTransactions();
              showTransactions();
            });
            return;
          }
          
          const values = row.querySelectorAll('td');
          if (button.textContent === 'Edit') {
            const fields = ['type', 'amount', 'category', 'itemName', 'date'];
            for (let i = 0; i < values.length - 1; i++) {
              const input = document.createElement('input');
              input.value = values[i].textContent.replace('$', '');
              input.name = fields[i];
              values[i].textContent = '';
              values[i].appendChild(input);
            }
            button.textContent = 'Save';
          } else {

            const updatedTransaction = {
              type: values[0].firstChild.value,
              amount: parseFloat(values[1].firstChild.value).toFixed(2),
              category: values[2].firstChild.value,
              itemName: values[3].firstChild.value,
              date: values[4].firstChild.value
            };
            transactions[idx] = updatedTransaction;
            saveTransactions();
            showTransactions();
          }
        });
        
        return button;
    }
      
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', function () {
        confirm(function () {
          localStorage.clear();
          window.location.href = 'login.html';
        });
      });
    }
  
    //Verify deletion or cancel 
    function confirm(action) {
      var modal = document.getElementById('confirm-modal');
      var confirmBtn = document.getElementById('confirm-btn');
      var cancelBtn = document.getElementById('cancel-btn');

      modal.style.display = 'block';
      confirmBtn.onclick = function() {
        action();
        closeModal(modal);
      };
      
      cancelBtn.onclick = function() {
        closeModal(modal);
      };
    
      window.onclick = function(event) {
        if (event.target === modal) {
          closeModal(modal);
        }
      };
    }
  
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    function getValue(id) {
      return document.getElementById(id).value;
    }
  
    function clearForm(ids) {
      ids.forEach(function(id) {
        document.getElementById(id).value = '';
      });
    }
  
    function closeModal(modal) {
      modal.style.display = 'none';
    }
  
    function saveTransactions() {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  
    // Summary of income, expenses, and balance
    function updateSummary() {
      var expense = 0;
      var income = 0;
    
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type.toLowerCase() === 'income') {
          income += amount;
        } else {
          expense += amount;
        }
      });
    
      const currentBalance = income - expense;
    
      if (totalIncome && totalExpense && balance) {
        totalIncome.textContent = '$' + income.toFixed(2);
        totalExpense.textContent = '$' + expense.toFixed(2);
        balance.textContent = '$' + currentBalance.toFixed(2);
    
        if (currentBalance >= 0) {
          balance.classList.remove('negative');
          balance.classList.add('positive');
        } else {
          balance.classList.remove('positive');
          balance.classList.add('negative');
        }
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
        var inputAmount = document.getElementById('amount-add');
        var valueAmount = parseFloat(inputAmount.value);
        var date = new Date().toLocaleDateString();
        var formattedAmount = valueAmount.toFixed(2);
        var button = event.currentTarget;
        var btnCategory = button.getAttribute('data-category');
        var transactionType, category, itemName;
        if (!valueAmount || isNaN(valueAmount) || valueAmount <= 0) {
          alert("Please enter a valid amount.");
          return;
        }
        if (button.innerText.trim().toLowerCase() === 'salary') {
          transactionType = "income";
          category = "N/A";
          itemName = "Salary";
        } else {
          transactionType = "expense";
          category = btnCategory;
          itemName = "N/A";
        }
    
        transactions.push({
          type: transactionType,
          amount: formattedAmount,
          category: category,
          itemName: itemName,
          date: date
        });
        saveTransactions();
        showTransactions();
        inputAmount.value = '';
    }  
    var quickBtn = document.querySelectorAll('.quick-add-btn');
    quickBtn.forEach(function(btn) {
        btn.addEventListener('click', handleQuickAdd);
    }); 
    loadBudget();
});
