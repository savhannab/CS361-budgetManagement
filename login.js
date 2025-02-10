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

    const signup = document.querySelector('#signup form');
    const email = document.querySelector('.email-input').value.trim();
    const password = signup.querySelector('#password').value;
    const confirmPassword = signup.querySelector('#confirmPassword').value;
    const confirmError = signup.querySelector('#confirm-error');
    
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

function saveAccount(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
}

function authenticateUser(event) {
    event.preventDefault();

    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password').value;


    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(function(user) {
        return user.email === email && user.password === password;
    });

    if (user) {
        localStorage.setItem('users', JSON.stringify(user));
        window.location.href = 'index.html';
    } else {
        alert('Invalid email or password.');
    }
}
viewPassword();
document.getElementById('signup').addEventListener('submit', isValid);
document.querySelector('#login-form').addEventListener('submit', authenticateUser);

