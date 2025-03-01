// Switch between forms
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
    attachLoginListener();
});

// Password visibility
document.querySelectorAll(".password-view-icon").forEach(icon => {
    icon.addEventListener("click", function () {
        const input = this.previousElementSibling;
        const eyeIcon = this.querySelector("i");

        if (input.type === "password") {
            input.type = "text";
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
        }
    });
});

// Create account
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
            localStorage.setItem("loggedin", JSON.stringify({ email: email }));
            window.location.href = "/home";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        errorElement.textContent = "An error occurred. Please try again.";
        errorElement.style.display = "block";
    });
});

// Login
function attachLoginListener() {
    const loginForm = document.getElementById("login-form");

    if (!loginForm || loginForm.dataset.listener === "true") return;
    loginForm.dataset.listener = "true";

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("login-email");
        const passwordInput = document.getElementById("login-password");
        const errorElement = document.getElementById("confirm-error");

        if (!emailInput || !passwordInput) {
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            errorElement.textContent = "All fields required.";
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
                errorElement.style.color = "red";
                errorElement.style.textAlign = "center";
                errorElement.style.display = "block";
            } else {
                localStorage.setItem("token", data.token);
                localStorage.setItem("loggedin", JSON.stringify({ email: email }));
                window.location.href = data.redirect;
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
            errorElement.textContent = "Error, try again.";
            errorElement.style.display = "block";
        });
    });
}

if (document.getElementById("login").style.display !== "none") {
    attachLoginListener();
}

// Guest Login
document.querySelectorAll(".guest-btn").forEach(button => {
    button.addEventListener("click", function () {
        window.location.href = "/home";
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedin"));

    if (loggedInUser && loggedInUser.email) {
        window.location.href = "/home";
    }
});
