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
    const categoriesMenuItem = document.querySelector("#categories-menu");

    if (!authButtons) {
      console.error("Auth buttons container not found");
      return;
    }

    if (data.loggedIn) {
      authButtons.innerHTML = '<button onclick="logout()">Log Out</button>';

      // Show the "Categories" menu item if the user is an admin
      if (data.isAdmin) {
        if (categoriesMenuItem) {
          categoriesMenuItem.style.display = "list-item";
        } else {
          console.error("Categories menu item not found");
        }
      } else {
        if (categoriesMenuItem) {
          categoriesMenuItem.style.display = "none";
        }
      }
    } else {
      authButtons.innerHTML = `
                <a href="/login.html"><button>Login</button></a>
                <a href="/signup.html"><button>Register</button></a>
            `;
      if (categoriesMenuItem) {
        categoriesMenuItem.style.display = "none";
      }
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
