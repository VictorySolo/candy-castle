document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Get order message from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const orderStatus = urlParams.get("status");
  const orderMessage = urlParams.get("message");

  const orderMessageElement = document.getElementById("order-message");
  if (orderStatus === "success") {
    // Display the order details using the information in orderMessage (JSON encoded)
    const orderDetails = JSON.parse(orderMessage);
    displayOrderDetails(orderDetails);
  } else {
    orderMessageElement.innerHTML = `<p>There was an error creating your order. Please try again.</p><p>Error: ${orderMessage}</p>`;
  }

  // Check if user is logged in to display auth buttons
  checkAuthStatus();
});

function displayOrderDetails(order) {
  const orderDetailsElement = document.createElement("div");
  orderDetailsElement.innerHTML = `
      <h3>Order Details</h3>
      <p>Order Date: ${new Date(order.date).toLocaleDateString()}</p>
      <p>Delivery Address: ${order.deliveryAddress}</p>
  `;

  // Create table for ordered items
  const table = document.createElement("table");
  table.className = "cart-table"; // Reuse the cart-table class

  // Create table header
  const header = table.createTHead();
  const headerRow = header.insertRow(0);
  const headers = ["Product Name", "Amount", "Price", "Total"];
  headers.forEach((headerText) => {
    const cell = document.createElement("th");
    cell.innerText = headerText;
    headerRow.appendChild(cell);
  });

  // Create table body
  const tbody = table.createTBody();
  let totalPrice = 0;

  order.products.forEach((item) => {
    const row = tbody.insertRow();
    const nameCell = row.insertCell(0);
    nameCell.innerText = item.name;

    const amountCell = row.insertCell(1);
    amountCell.innerText = item.amount;

    const priceCell = row.insertCell(2);
    priceCell.innerText = `$${item.price.toFixed(2)}`;

    const totalCell = row.insertCell(3);
    const total = item.amount * item.price;
    totalCell.innerText = `$${total.toFixed(2)}`;

    totalPrice += total;
  });

  orderDetailsElement.appendChild(table);

  const totalPriceElement = document.createElement("div");
  totalPriceElement.className = "total-price"; // Apply the existing class
  totalPriceElement.textContent = `Total Price: $${order.price.toFixed(2)}`;
  orderDetailsElement.appendChild(totalPriceElement);

  document
    .getElementById("order-confirmation-section")
    .appendChild(orderDetailsElement);
}
