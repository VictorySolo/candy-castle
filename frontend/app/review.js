document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");

  if (productId) {
    // Pre-fill product information or other necessary fields if needed
    const productIdElement = document.getElementById("product-id");
    if (productIdElement) {
      productIdElement.value = productId;
      console.log("Product ID:", productId); // Log the product ID for debugging
    } else {
      console.error("Element with ID 'product-id' not found.");
    }

    // Fetch existing review for the product
    try {
      const response = await fetch(`/reviews?productId=${productId}`);
      if (response.ok) {
        const reviews = await response.json();
        if (reviews.length > 0) {
          const existingReview = reviews[0];
          document.getElementById("rating").value = existingReview.rating;
          document.getElementById("comment").value = existingReview.comment;
          console.log("Existing review pre-filled:", existingReview);
        }
      } else {
        console.error("Failed to fetch existing reviews.");
      }
    } catch (error) {
      console.error("Error fetching existing review:", error);
    }
  } else {
    console.error("Product ID is missing in the URL parameters."); // Log an error if productId is missing
  }

  // Show the return button
  // Ensure the return button is always in the DOM
  const responseContainer = document.getElementById("response-container");
  responseContainer.innerHTML = `
  <button id="return-to-product-overview">Return to Product Overview</button>
`;
  responseContainer.style.display = "block";

  // Add event listener for "Return to Product Overview" button
  function addReturnButtonListener() {
    const returnButton = document.getElementById("return-to-product-overview");
    if (returnButton) {
      returnButton.addEventListener("click", () => {
        const productId = document.getElementById("product-id").value;
        window.location.href = `product.html?id=${productId}`;
      });
    }
  }

  // Initial attachment of the event listener
  addReturnButtonListener();

  // Reattach event listener after updating the responseContainer
  document
    .getElementById("return-to-product-overview")
    .addEventListener("click", () => {
      const productId = document.getElementById("product-id").value;
      window.location.href = `product.html?id=${productId}`;
    });

  // Add event listener for review form submission
  document
    .getElementById("review-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default form submission

      const formData = new FormData(event.target);
      const reviewData = {
        productId: formData.get("productId"),
        comment: formData.get("comment"),
        rating: parseInt(formData.get("rating")),
      };

      // Log the review data for debugging
      console.log("Review Data to Submit:", reviewData);

      try {
        const response = await fetch("/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          responseContainer.innerHTML = `<p>Failed to submit review: ${errorText}</p>`;
          responseContainer.style.display = "block";
          addReturnButtonListener(); // Reattach event listener
          return;
        }

        const result = await response.json();
        console.log("Review submitted successfully:", result.message);

        responseContainer.innerHTML = `
          <p>${result.message}</p>
          <button id="return-to-product-overview">Return to Product Overview</button>
        `;
        responseContainer.style.display = "block";
        addReturnButtonListener(); // Reattach event listener
      } catch (error) {
        console.error("Error submitting review:", error);
        responseContainer.innerHTML = `<p>There was an error submitting your review: ${error.message}</p>`;
      }
    });

  updateCartCount();
});

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
