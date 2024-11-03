document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  updateCartCount();

  document
    .getElementById("login-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        displayError("Both email and password are required.");
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, cart }),
        });

        const data = await response.json();

        if (data.message === "Logged in successfully") {
          await transferCartToDB(cart, data.customerId);
          window.location.href = "cart.html"; // Redirect to cart page
        } else {
          displayError(
            data.message || "Incorrect email or password. Please try again."
          );
        }
      } catch (error) {
        console.error("Error logging in:", error);
        displayError("Failed to login. Please try again.");
      }
    });

  document.getElementById("signup-btn").addEventListener("click", () => {
    window.location.href = "signup.html";
  });
});

async function transferCartToDB(cart, customerId) {
  try {
    const response = await fetch("/cart/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart, customerId }),
    });

    if (response.ok) {
      console.log("Cart transferred to database successfully");
      localStorage.removeItem("cart");
    } else {
      console.error("Failed to transfer cart to database");
    }
  } catch (error) {
    console.error("Error transferring cart to database:", error);
  }
}

function displayError(message) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.innerText = message;
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("Updating cart count:", cart);
  const cartCount = cart.reduce((total, item) => total + item.amount, 0);
  document.getElementById("cart-count").textContent = cartCount;
}

function placeOrder() {
  window.location.href = "order.html";
}
