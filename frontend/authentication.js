async function checkAuthStatus() {
  try {
    const response = await fetch("/isLoggedIn", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const authButtons = document.getElementById("auth-buttons");

    if (data.loggedIn) {
      authButtons.innerHTML = '<button onclick="logout()">Log Out</button>';
    } else {
      authButtons.innerHTML = `
                <a href="/login.html"><button>Login</button></a>
                <a href="/signup.html"><button>Register</button></a>
            `;
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
  }
}
// -- logout function call
async function logout() {
  try {
    const response = await fetch("/logout", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("Logged out successfully");
      window.location.href = "/";
    } else {
      console.error("Failed to log out");
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

// Ensure to call checkAuthStatus on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
});
