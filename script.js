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
  var transactions = JSON.parse(localStorage.getItem('transactions')) || [];

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

  document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('users');
    window.location.href = 'login.html';
  });

  function loadTransactions() {

    if (transactionTable) {
      transactions.forEach(function(transaction) {
        transactionTable.appendChild(createRow(transaction.type, transaction.amount, transaction.name, transaction.date));
      });
    }
    updateSummary(); 
  }

  window.addEventListener('load', loadTransactions);
    if (transactionbtn) {
      transactionbtn.addEventListener('click', function() {
        addTransaction();
      });
  }

  function addTransaction() {
    var type = getValue('type');
    var amount = parseFloat(getValue('amount')).toFixed(2);
    var category = getValue('expense-category');
    var itemName = getValue('item-name');
    var date = getValue('date');

    if (!type || !amount || !category || !itemName || !date || isNaN(amount)) {
      alert('Please fill in all fields.');
      return;
    }

    var addRow = createRow(type, amount, category, itemName, date);
    transactionTable.appendChild(addRow);
    clearForm(['type', 'amount', 'expense-category', 'item-name', 'date']);
    transactions.push({ type, amount, category, itemName, date });
    saveTransactions();
    updateSummary(); 
  }

  function createRow(type, amount, category, itemName, date) {
    var row = document.createElement('tr');
    row.classList.add('transaction-row'); 
    row.setAttribute('data-type', type.toLowerCase()); 
    row.setAttribute('data-category', category.toLowerCase());
    row.setAttribute('data-date', date);
    row.appendChild(addElement(capitalize(type)));
    row.appendChild(addElement('$' + amount));
    row.appendChild(addElement(category));
    row.appendChild(addElement(itemName));
    row.appendChild(addElement(date));

    var newElement = addElement('');
    var editBtn = createButton('Edit', 'edit-btn', row);
    var deleteBtn = createButton('Delete', 'delete-btn', row);

    newElement.appendChild(editBtn);
    newElement.appendChild(deleteBtn);
    row.appendChild(newElement);

    return row;
  }

  function addElement(text) {
    var element = document.createElement('td');
    element.textContent = text;
    return element;
  }

  function createButton(text, className, row) {
    var button = document.createElement('button');
    button.textContent = text;
    button.className = className;

    if (text === 'Delete') {
      button.addEventListener('click', function() {
        confirm(function() {
          const index = Array.from(transactionTable.children).indexOf(row);
          transactions.splice(index, 1);
          saveTransactions();
          row.remove();
          updateSummary(); 
        });
      });
    } else if (text === 'Edit') {
      button.addEventListener('click', function() {
        alert('Edit functionality not implemented yet!');
      });
    }

    return button;
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function () {
      confirm(function () {
        localStorage.clear();
        alert('Your account data has been deleted.');
        // Optionally redirect or refresh after account deletion
        window.location.reload();
      });
    });
  }

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

  function clearForm(idx) {
    for (var i = 0; i < idx.length; i++) {
      document.getElementById(idx[i]).value = '';
    }
  }

  function closeModal(modal) {
    modal.style.display = 'none';
  }

  function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  function updateSummary() {
    var expense = 0;
    var income = 0;
  
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
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
  document.getElementById('filter-category').addEventListener('change', filterTransactions);
  document.getElementById('filter-date').addEventListener('change', filterTransactions);
  document.getElementById('filter-type').addEventListener('change', filterTransactions);
  console.log(document.getElementById('filter-category'));
  
  function filterTransactions() {
    const rows = document.querySelectorAll("tr.transaction-row");
  
    const filterCategory = document.getElementById('filter-category').value.toLowerCase(); // Convert to lowercase
    const filterDate = document.getElementById('filter-date').value;
    const filterType = document.getElementById('filter-type').value.toLowerCase();
  
    rows.forEach(row => {
      const transactionCategory = row.getAttribute("data-category").toLowerCase();
      const transactionDate = row.getAttribute("data-date");
      const transactionType = row.getAttribute("data-type");
  
      const categoryMatch = filterCategory === "all" || transactionCategory === filterCategory;
      const dateMatch = !filterDate || transactionDate === filterDate;
      const typeMatch = filterType === "select" || transactionType === filterType;
  
      if (categoryMatch && dateMatch && typeMatch) {
        row.style.display = "table-row";
      } else {
        row.style.display = "none";
      }
    });
  }
});
