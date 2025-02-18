document.getElementById('signing-up').addEventListener('click', function(event)  {
    event.preventDefault();
    document.querySelector('.selection.active').classList.remove('active');
    this.parentElement.classList.add('active');
    document.getElementById('signup').style.display = 'block';
    document.getElementById('login').style.display = 'none';
});

document.getElementById('logging-in').addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('.selection.active').classList.remove('active');
    this.parentElement.classList.add('active');
    document.getElementById('login').style.display = 'block';
    document.getElementById('signup').style.display = 'none';
});

document.getElementById('guest-login-btn').addEventListener('click', function() {
    window.location.href = 'index.html';  
});

function viewPassword() {
    document.querySelectorAll('.password-view-icon').forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                this.querySelector('i').classList.remove('fa-eye');
                this.querySelector('i').classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.querySelector('i').classList.remove('fa-eye-slash');
                this.querySelector('i').classList.add('fa-eye');
            }
        });
    });
}

function isValid(event) {
    event.preventDefault();  

    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmError = document.getElementById('confirm-error');
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert('All fields required.');
        return;
    }
    if (checkAccount(email)) {
        alert('An account with this email already exists.')
        return;
    }
    if (password !== confirmPassword) {
        confirmError.style.color = 'red';
        confirmError.textContent = 'Passwords do not match.';
        return;
    } 
    else {
        confirmError.textContent = '';
    }
    console.log('Saving account with:', { firstName, lastName, email, password });
    saveAccount(firstName, lastName, email, password);
    window.location.href = 'index.html';
}

function checkAccount(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            return true;
        }
    }
    return false;
}

function saveAccount(firstName, lastName, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ firstName: firstName, lastName: lastName, email: email, password: password});
    localStorage.setItem('users', JSON.stringify(users));
}

document.getElementById('login-form').addEventListener('submit', authenticateUser);

function authenticateUser(event) {
    event.preventDefault(); 

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password);

    if (user) {
        localStorage.setItem('loggedin', JSON.stringify(user));
        window.location.href = 'index.html';  
    } else {
        alert('Invalid email or password.');
    }
}

viewPassword();
document.querySelector('#signup-form').addEventListener('submit', isValid);
document.querySelector('#login-form').addEventListener('submit', authenticateUser);

const currentUser = JSON.parse(localStorage.getItem('loggedin'));
const usernameDisplay = document.getElementById('first-name');

if (currentUser && currentUser.firstName && usernameDisplay) {
    usernameDisplay.textContent = currentUser.firstName;
} else if (window.location.pathname.includes('index.html') && !currentUser) {
    window.location.href = 'login.html';
} 





