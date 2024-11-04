document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  updateCartCount();

  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const age = document.getElementById("age").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const deliveryAddress = document
      .getElementById("deliveryAddress")
      .value.trim();

    if (!firstName || !lastName || !email || !password || !age || !phone) {
      displayError("Please fill in all mandatory fields.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      displayError(
        "Password must be at least 8 characters long and include upper and lower case letters, a number, and a special character."
      );
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    try {
      const response = await fetch("/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          age,
          phone,
          deliveryAddress,
        }),
      });

      const data = await response.json();

      if (data.message === "Customer created successfully") {
        const loginResponse = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, cart }),
        });

        const loginData = await loginResponse.json();

        if (loginData.message === "Logged in successfully") {
          await transferCartToDB(cart, loginData.customerId);
          localStorage.removeItem("cart"); // Clear cart after transfer
          window.location.href = "cart.html"; // Redirect to cart page
        } else {
          displayError(
            loginData.message ||
              "Failed to log in after signup. Please try again."
          );
        }
      } else {
        displayError(data.message || "Failed to sign up. Please try again.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      displayError("Failed to sign up. Please try again.");
    }
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
