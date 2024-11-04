document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Get order message from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const orderStatus = urlParams.get("status");
  const orderId = urlParams.get("orderId");
  const orderMessage = urlParams.get("message");

  const orderMessageElement = document.getElementById("order-message");
  if (orderStatus === "success") {
    orderMessageElement.innerHTML = `<p>Your order has been successfully placed!</p><p>Order ID: ${orderId}</p>`;
  } else {
    orderMessageElement.innerHTML = `<p>There was an error creating your order. Please try again.</p><p>Error: ${orderMessage}</p>`;
  }

  // Check if user is logged in to display auth buttons
  checkAuthStatus();

  // Display order details
  if (orderId) {
    displayOrderDetails(orderId);
  }
});

async function displayOrderDetails(orderId) {
  try {
    const response = await fetch(`/orders/${orderId}`);
    const order = await response.json();

    if (order) {
      const orderDetailsElement = document.createElement("div");
      orderDetailsElement.innerHTML = `
          <h3>Order Details</h3>
          <p>Order ID: ${order._id}</p>
          <p>Delivery Address: ${order.deliveryAddress}</p>
          <h4>Items:</h4>
          <ul>
            ${order.items
              .map(
                (item) => `
              <li>${item.productName} (x${item.amount}) - $${item.price.toFixed(
                  2
                )}</li>
            `
              )
              .join("")}
          </ul>
          <p>Total Price: $${order.totalPrice.toFixed(2)}</p>
        `;
      document
        .getElementById("order-confirmation-section")
        .appendChild(orderDetailsElement);
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
  }
}
