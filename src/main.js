import './style.css';

const url = import.meta.env.VITE_APP_URL;

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("accessToken")) {
    window.location.href = `${url}/dashboard/dashboard.html`;
  } else {
    window.location.href = `${url}/login/login.html`;
  }
})