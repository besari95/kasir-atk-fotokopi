const form = document.getElementById('loginForm')
const errorMsg = document.getElementById('errorMsg')

// Password default
const DEFAULT_PASSWORD = 'admin123'

form.addEventListener('submit', (e) => {
  e.preventDefault()

  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value

  const savedPassword = localStorage.getItem('password') || DEFAULT_PASSWORD

  if (username === 'admin' && password === savedPassword) {
    // Login berhasil
    localStorage.setItem('isLoggedIn', 'true')
    window.location.href = 'kasir.html'
  } else {
    errorMsg.textContent = 'Username atau password salah!'
    errorMsg.classList.remove('hidden')
  }
})