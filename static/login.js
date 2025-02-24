// Handle switching between Sign Up and Log In forms
document.getElementById("signing-up").addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector(".selection.active").classList.remove("active");
    this.parentElement.classList.add("active");
    document.getElementById("signup").style.display = "block";
    document.getElementById("login").style.display = "none";
});

document.getElementById("logging-in").addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector(".selection.active").classList.remove("active");
    this.parentElement.classList.add("active");
    document.getElementById("login").style.display = "block";
    document.getElementById("signup").style.display = "none";
});

// Handle password visibility toggle for all password fields
document.querySelectorAll(".password-view-icon").forEach(icon => {
    icon.addEventListener("click", function () {
        const input = this.previousElementSibling;

        if (input.type === "password") {
            input.type = "text";
            this.querySelector("i").classList.remove("fa-eye");
            this.querySelector("i").classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            this.querySelector("i").classList.remove("fa-eye-slash");
            this.querySelector("i").classList.add("fa-eye");
        }
    });
});

// Handle Sign Up Form Submission
document.getElementById("signup-form").addEventListener("submit", function (event) {
    event.preventDefault(); 

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorElement = document.getElementById("confirm-error");

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        errorElement.textContent = "All fields are required.";
        errorElement.style.display = "block";
        return;
    }

    if (password !== confirmPassword) {
        errorElement.textContent = "Passwords do not match.";
        errorElement.style.display = "block";
        errorElement.style.color = "red";
        errorElement.style.textAlign = "center";
        return;
    }

    fetch("/api/users", {
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
            window.location.href = "/home";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        errorElement.textContent = "An error occurred. Please try again.";
        errorElement.style.display = "block";
    });
});

// Handle Login Form Submission
document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorElement = document.getElementById("confirm-error");

    if (!email || !password) {
        errorElement.textContent = "Email and password are required.";
        errorElement.style.display = "block";
        return;
    }

    fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            errorElement.textContent = data.error;
            errorElement.style.display = "block";
        } else {
            localStorage.setItem("token", data.token);  
            window.location.href = data.redirect;  
        }
    });
    errorElement.textContent = "Invalid credentials";
    errorElement.style.color = "red";
    errorElement.style.textAlign = "center";
    errorElement.style.display = "block";
});

// Guest Login
document.querySelectorAll(".guest-btn").forEach(button => {
    button.addEventListener("click", function () {
        window.location.href = "/home";
    });
});



