async function initCart() {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    loadCartItems(); // Call this for logged-in users
  } else {
    displayCartItems(); // Call this for unlogged users
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");
  updateCartCount();
  await initCart();
  await checkAuthStatus();

  const cartItemsSection = document.getElementById("cart-items-section");

  // Create a container for the label and input field
  const inputContainer = document.createElement("div");
  inputContainer.style.display = "flex";
  inputContainer.style.justifyContent = "center";
  inputContainer.style.marginTop = "10px";
  inputContainer.style.visibility = "hidden"; // Start hidden

  // Create Delivery Address input field
  const deliveryAddressLabel = document.createElement("label");
  deliveryAddressLabel.for = "delivery-address";
  deliveryAddressLabel.innerText = "Delivery Address";
  deliveryAddressLabel.style.marginRight = "10px"; // Add some margin between label and input
  inputContainer.appendChild(deliveryAddressLabel);

  const deliveryAddressInput = document.createElement("input");
  deliveryAddressInput.id = "delivery-address";
  deliveryAddressInput.name = "deliveryAddress";
  deliveryAddressInput.type = "text";
  deliveryAddressInput.required = true;
  deliveryAddressInput.style.width = "50%";
  inputContainer.appendChild(deliveryAddressInput);

  // Insert the input container above the Create Order button
  const orderButton = document.getElementById("order-button");
  cartItemsSection.insertBefore(inputContainer, orderButton);

  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    // Make input field visible if logged in
    inputContainer.style.visibility = "visible";
    deliveryAddressInput.required = true; // Make it mandatory

    // Fetch customer information
    const customerResponse = await fetch("/customers/info");
    const customerData = await customerResponse.json();

    if (customerData.deliveryAddress) {
      deliveryAddressInput.value = customerData.deliveryAddress;
    }
  }

  document
    .getElementById("order-button")
    .addEventListener("click", async () => {
      try {
        const authResponse = await fetch("/isLoggedIn");
        const authData = await authResponse.json();

        if (!authData.loggedIn) {
          window.location.href = "login.html";
          return;
        }

        const deliveryAddress = document
          .getElementById("delivery-address")
          .value.trim();
        if (!deliveryAddress) {
          alert("Delivery Address is required.");
          return;
        }

        const response = await fetch("/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deliveryAddress }),
        });

        const data = await response.json();
        if (data.status === "success") {
          // Pass the entire responseOrder as a URL parameter
          window.location.href = `order.html?status=success&message=${encodeURIComponent(
            JSON.stringify(data.order)
          )}`;
        } else {
          window.location.href = `order.html?status=error&message=${data.message}`;
        }
      } catch (error) {
        console.error("Error creating order:", error);
        window.location.href =
          "order.html?status=error&message=There was an error creating your order. Please try again.";
      }
    });

  // Add reset cart event listener
  document
    .getElementById("reset-cart-button")
    .addEventListener("click", async () => {
      await resetCart();
    });
});

// -- resetting cart
async function resetCart() {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    try {
      const response = await fetch("/cart/extra", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to reset cart.");
      }

      await loadCartItems(); // Refresh cart items
      updateCartCount(); // Update cart count
    } catch (error) {
      console.error("Error resetting cart:", error);
    }
  } else {
    localStorage.removeItem("cart");

    displayCartItems(); // Refresh cart items
    updateCartCount(); // Update cart count
  }
}

// Function to check if customer is logged in
function checkIfLoggedIn() {
  fetch("/isLoggedIn")
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedIn) {
        // Customer is logged in, proceed to place order
        placeOrder();
      } else {
        // Customer is not logged in, redirect to login page
        window.location.href = "login.html";
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
    });
}

// Function to place an order
function placeOrder() {
  fetch("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deliveryAddress: "Your Address Here", // Replace with actual address logic
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Order created") {
        // Order created successfully, redirect to order page
        window.location.href = "order.html";
      } else {
        // Failed to create order, display error
        alert("Failed to create order. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error placing order:", error);
    });
}

// Function to fetch product details by ID
async function fetchProductDetails(productId) {
  try {
    console.log(`Fetching details for product ID: ${productId}`);
    const response = await fetch(`/products/${productId}`);
    const product = await response.json();
    console.log(`Fetched product details:`, product);
    return product;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

// Function to display cart items on the cart page
function displayCartItems() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  const table = document.createElement("table");
  table.className = "cart-table";
  table.innerHTML = `
    <tr>
      <th>Product Name</th>
      <th>Price</th>
      <th>Amount</th>
      <th>Total</th>
      <th>Action</th>
    </tr>
  `;

  let totalPrice = 0;

  for (const item of cart) {
    // Ensure price and amount are present
    const price = item.price || 0;
    const amount = item.amount || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name || "Unknown"}</td>
      <td>$${price.toFixed(2)}</td>
      <td>
        <input type="number" value="${amount}" min="1" data-id="${
      item.productId
    }">
      </td>
      <td>$${(price * amount).toFixed(2)}</td>
      <td>
        <button class="update-button" data-id="${
          item.productId
        }">Update</button>
        <button class="delete-button" data-id="${
          item.productId
        }">Delete</button>
      </td>
    `;
    table.appendChild(row);
    totalPrice += price * amount;
  }

  cartItemsContainer.appendChild(table);

  const totalPriceElement = document.createElement("div");
  totalPriceElement.className = "total-price";
  totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
  cartItemsContainer.appendChild(totalPriceElement);

  addUpdateButtonListeners();
}

// -- Update cart count in the UI
async function updateCartCount() {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  let cart = [];

  if (authData.loggedIn) {
    const cartResponse = await fetch("/cart");
    const cartData = await cartResponse.json();

    if (cartData.items) {
      cart = cartData.items; // Use cart items from DB if logged in
    }
  } else {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }

  const cartCount = cart.reduce((total, item) => total + item.amount, 0);
  document.getElementById("cart-count").textContent = cartCount;
}

// -- checking authentication status function
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
// -- loading cart items
async function loadCartItems() {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    const cartResponse = await fetch("/cart");
    const cartData = await cartResponse.json();

    if (cartData.items) {
      const cartItemsContainer = document.getElementById("cart-items");
      cartItemsContainer.innerHTML = "";

      const table = document.createElement("table");
      table.className = "cart-table";
      table.innerHTML = `
        <tr>
          <th>Product Name</th>
          <th>Price</th>
          <th>Amount</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
      `;

      let totalPrice = 0;

      for (const item of cartData.items) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>
            <input type="number" value="${item.amount}" min="1" data-id="${
          item.id
        }">
          </td>
          <td>$${(item.price * item.amount).toFixed(2)}</td>
          <td>
            <button class="update-button" data-id="${item.id}">Update</button>
            <button class="delete-button" data-id="${
              item.productId
            }">Delete</button>
          </td>
        `;
        table.appendChild(row);
        totalPrice += item.price * item.amount;
      }

      cartItemsContainer.appendChild(table);

      const totalPriceElement = document.createElement("div");
      totalPriceElement.className = "total-price";
      totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
      cartItemsContainer.appendChild(totalPriceElement);

      addUpdateButtonListeners();
    }
  }
}
// Add event listeners to update buttons
function addUpdateButtonListeners() {
  document.querySelectorAll(".update-button").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const button = event.target;
      const inputElement = button
        .closest("tr")
        .querySelector('input[type="number"]');
      const productId = inputElement.dataset.id;
      const amount = inputElement.value;
      console.log(
        `2. (loadCartItems) productId: ${productId}, newAmount: ${amount}`
      );
      await updateCartItem(productId, amount);
    });
  });
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const button = event.target;
      const inputElement = button
        .closest("tr")
        .querySelector('input[type="number"]');
      const productId = inputElement.dataset.id;
      console.log(`2. (loadCartItems) productId: ${productId}`);
      await deleteCartItem(productId);
    });
  });
}

// -- updating cart item amount
async function updateCartItem(productId, amount) {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    // For logged-in users, send PUT request to server
    try {
      const response = await fetch("/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart item amount.");
      }

      // Refresh cart items and cart count
      loadCartItems();
      updateCartCount();
    } catch (error) {
      console.error("Error updating cart item amount:", error);
    }
  } else {
    // For unlogged users, update cart in local storage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const itemIndex = cart.findIndex((item) => item.productId === productId);

    if (itemIndex !== -1) {
      cart[itemIndex].amount = parseInt(amount);
      localStorage.setItem("cart", JSON.stringify(cart));

      loadCartItems();
      updateCartCount();
    } else {
      console.error("Product not found in cart. Cart:", cart);
    }
  }
}

async function deleteCartItem(productId) {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    try {
      const response = await fetch("/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete cart item.");
      }

      loadCartItems(); // Refresh cart items
      updateCartCount(); // Update cart count
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  } else {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter((item) => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));

    displayCartItems(); // Refresh cart items
    updateCartCount(); // Update cart count
  }
}
