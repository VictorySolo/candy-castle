document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");
  updateCartCount();
  await loadCartItems();
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
  }

  document
    .getElementById("order-button")
    .addEventListener("click", async () => {
      try {
        if (!authData.loggedIn) {
          window.location.href = "login.html";
          return;
        }

        const deliveryAddress = deliveryAddressInput.value.trim();
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
          window.location.href = `order.html?status=success&orderId=${data.orderId}`;
        } else {
          window.location.href = `order.html?status=error&message=${data.message}`;
        }
      } catch (error) {
        console.error("Error creating order:", error);
        window.location.href =
          "order.html?status=error&message=There was an error creating your order. Please try again.";
      }
    });
});

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
async function displayCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("Displaying cart items:", cart); // Debug log
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = ""; // Clear any existing content

  const table = document.createElement("table");
  table.className = "cart-table";

  // Create table header
  const header = table.createTHead();
  const headerRow = header.insertRow(0);
  const headers = ["Name", "Amount", "Price", "Cost"];
  headers.forEach((headerText) => {
    const cell = document.createElement("th");
    cell.innerText = headerText;
    headerRow.appendChild(cell);
  });

  // Create table body
  const tbody = table.createTBody();
  let totalPrice = 0;

  for (const item of cart) {
    console.log(`Processing item:`, item); // Debug log
    const product = await fetchProductDetails(item.productId);
    const row = tbody.insertRow();

    if (product) {
      const nameCell = row.insertCell(0);
      nameCell.innerText = product.name;

      const amountCell = row.insertCell(1);
      amountCell.innerText = item.amount;

      const priceCell = row.insertCell(2);
      priceCell.innerText = `$${product.price.toFixed(2)}`;

      const costCell = row.insertCell(3);
      const cost = item.amount * product.price;
      costCell.innerText = `$${cost.toFixed(2)}`;

      totalPrice += cost;
    } else {
      console.error(
        `Failed to fetch product details for ID: ${item.productId}`
      ); // Debug log
      const nameCell = row.insertCell(0);
      nameCell.innerText = `Product ID: ${item.productId}`;

      const amountCell = row.insertCell(1);
      amountCell.innerText = item.amount;

      const priceCell = row.insertCell(2);
      priceCell.innerText = "N/A";

      const costCell = row.insertCell(3);
      costCell.innerText = "N/A";
    }
  }

  cartItemsContainer.appendChild(table);

  // Display total price
  const totalPriceElement = document.createElement("div");
  totalPriceElement.className = "total-price";
  totalPriceElement.innerText = `Total Price: $${totalPrice.toFixed(2)}`;
  cartItemsContainer.appendChild(totalPriceElement);
}

// Function to update the cart count displayed in the header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
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
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  const table = document.createElement("table");
  table.className = "cart-table"; // Apply the existing class
  table.innerHTML = `
          <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Total</th>
          </tr>
      `;

  let totalPrice = 0;

  for (const item of cart) {
    try {
      const response = await fetch(`/products/${item.productId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch product details for productId ${item.productId}`
        );
      }

      const product = await response.json();

      const row = document.createElement("tr");
      row.innerHTML = `
                  <td>${product.name}</td>
                  <td>$${product.price.toFixed(2)}</td>
                  <td>${item.amount}</td>
                  <td>$${(product.price * item.amount).toFixed(2)}</td>
              `;
      table.appendChild(row);
      totalPrice += product.price * item.amount;
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  }

  cartItemsContainer.appendChild(table);

  const totalPriceElement = document.createElement("div");
  totalPriceElement.className = "total-price"; // Apply the existing class
  totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
  cartItemsContainer.appendChild(totalPriceElement);
}
