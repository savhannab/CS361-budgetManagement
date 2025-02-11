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
  const loggedInUser = JSON.parse(localStorage.getItem('loggedin'));

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
    localStorage.removeItem('loggedin');
    window.location.href = 'login.html';
  });

  if (loggedInUser && loggedInUser.firstName) {
    document.getElementById('first-name').textContent = loggedInUser.firstName;
  } else {
    document.getElementById('first-name').textContent = 'Guest'; 
  }
  function loadTransactions() {

    if (transactionTable) {
      transactions.forEach(function(transaction) {
        transactionTable.appendChild(createRow(transaction.type, transaction.amount, transaction.category, transaction.itemName, transaction.date));
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
      alert('All fields required.');
      return;
    }

    var addRow = createRow(type, amount, category, itemName, date);
    transactionTable.appendChild(addRow);
    transactions.push({ type, amount, category, itemName, date });
    saveTransactions();
    updateSummary(); 
    clearForm(['type', 'amount', 'expense-category', 'item-name', 'date']);
  }

  function createRow(type, amount, category, itemName, date) {
    var row = document.createElement('tr');
    row.classList.add('transaction-row'); 
    row.setAttribute('data-type', type.toLowerCase()); 
    row.setAttribute('data-category', category);
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
    } 
    else if (text === 'Edit') {
      button.addEventListener('click', function () {
        const index = Array.from(transactionTable.children).indexOf(row);
        const values = row.querySelectorAll('td');
    
        if (button.textContent === 'Edit') {

          const fieldNames = ['type', 'amount', 'category', 'itemName', 'date'];
    
          for (let i = 0; i < values.length - 1; i++) { 
            const input = document.createElement('input');
            input.value = values[i].textContent.replace('$', ''); 
            input.name = fieldNames[i]; 
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
    
          transactions[index] = updatedTransaction;
    
          values[0].textContent = capitalize(updatedTransaction.type);
          values[1].textContent = '$' + updatedTransaction.amount;
          values[2].textContent = updatedTransaction.category;
          values[3].textContent = updatedTransaction.itemName;
          values[4].textContent = updatedTransaction.date;
    
          saveTransactions();
          updateSummary();
    
          button.textContent = 'Edit';
        }
      });  
    }  
    return button;
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function () {
      confirm(function () {
        localStorage.clear();
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
  
  if (document.getElementById('filter-category') && document.getElementById('filter-date') && document.getElementById('filter-type')) {
    const filterCategory = document.getElementById('filter-category');
    const filterDate = document.getElementById('filter-date');
    const filterType = document.getElementById('filter-type');
    
    filterCategory.addEventListener('change', filterTransactions);
    filterDate.addEventListener('change', filterTransactions);
    filterType.addEventListener('change', filterTransactions);
  }
  
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
  
      if (categoryMatch && dateMatch && typeMatch) {
        row.style.display = "table-row";
      } else {
        row.style.display = "none";
      }
    });
  }
  window.addEventListener('load', loadTransactions);
});
