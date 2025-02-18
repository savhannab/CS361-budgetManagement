document.addEventListener('DOMContentLoaded', function () {
    const updateBtn = document.getElementById('update-btn');
    const preferencesBtn = document.getElementById('preferences');
  
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedin')) || {};
  
    if (loggedInUser.firstName) {
        document.getElementById('first-name').textContent = loggedInUser.firstName;
    }
  
    if (loggedInUser.preferences) {
        if (loggedInUser.preferences.darkMode) {
            document.body.classList.add('dark-mode');
        }
        if (loggedInUser.preferences.themeColor) {
            document.documentElement.style.setProperty('--theme-color', loggedInUser.preferences.themeColor);
        }
    }
  
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
  
    viewPassword();
  
    if (updateBtn) {
        updateBtn.addEventListener('click', function () {
  
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
  
      if (loggedInUser.password !== currentPassword) {
        alert('Invalid password. Try again.');
        return;
      }
  
      const updatedUsers = users.map(user => {
        if (user.email === loggedInUser.email) {
          user.password = newPassword;
        }
        return user;
      });
  
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      loggedInUser.password = newPassword;
      localStorage.setItem('loggedin', JSON.stringify(loggedInUser));
      alert('Password updated');
    });
  
    if (preferencesBtn) preferencesBtn.addEventListener('click', function () {
        const darkMode = document.getElementById('dark-mode').checked;
        const themeColor = document.getElementById('theme-color').value;
    
        if (darkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
    
        document.documentElement.style.setProperty('--theme-color', themeColor);
    
        const updatedUsers = users.map(user => {
          if (user.email === loggedInUser.email) {
            user.preferences = { darkMode, themeColor };
          }
          return user;
        });
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        loggedInUser.preferences = { darkMode, themeColor };
        localStorage.setItem('loggedin', JSON.stringify(loggedInUser));
        });
    }
});
  