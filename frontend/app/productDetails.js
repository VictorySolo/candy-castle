document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    await fetchProductDetails(productId);
    await fetchProductReviews(productId);
  }
  updateCartCount();
  await checkAuthStatus(productId); // Check authentication status and display "Write a Review" button if logged in
});

async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`/products/${productId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product details.");
    }
    const product = await response.json();
    displayProductDetails(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
}

async function fetchProductReviews(productId) {
  try {
    const response = await fetch(`/reviews?productId=${productId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product reviews.");
    }
    const reviews = await response.json();
    displayProductReviews(reviews);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
  }
}

async function displayProductDetails(product) {
  const productDetailsSection = document.getElementById("product-details");
  productDetailsSection.innerHTML = `
      <div class="product-detail-card">
        <img src="${product.imagePath || "../images/candy-shop.png"}" alt="${
    product.name
  }" class="product-detail-img">
        <h2 class="product-detail-name">${product.name}</h2>
        <p class="product-detail-description">${product.description}</p>
        <p class="product-detail-composition">Composition: ${
          product.composition
        }</p>
        <p class="product-detail-weight">Weight: ${product.weight}g</p>
        <p class="product-detail-energy">Energy: ${product.energy} kcal</p>
        <p class="product-detail-price">$${product.price.toFixed(2)}</p>
        <p class="product-detail-amount">Amount available: ${product.amount}</p>
        <button onclick="addToCart('${product._id}')">Add to Cart</button>
        <div id="write-review-button-container"></div>
      </div>
      <h3>Reviews</h3>
      <div id="reviews-section">
        <!-- Reviews will be injected here by JavaScript -->
      </div>
    `;

  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();
  console.log("User Logged In:", authData.loggedIn);

  if (authData.loggedIn) {
    const writeReviewButtonContainer = document.getElementById(
      "write-review-button-container"
    );
    const writeReviewButton = document.createElement("button");
    writeReviewButton.textContent = "Write a Review";
    writeReviewButton.onclick = () => {
      window.location.href = `review.html?productId=${product._id}`;
    };
    writeReviewButtonContainer.appendChild(writeReviewButton);
  }
}

function displayProductReviews(reviews) {
  const reviewsSection = document.getElementById("reviews-section");

  if (reviews.length === 0) {
    reviewsSection.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  reviewsSection.innerHTML = "";
  reviews.forEach((review) => {
    const reviewCard = document.createElement("div");
    reviewCard.className = "review-card";
    reviewCard.innerHTML = `
        <p><strong>Rating:</strong> ${review.rating} / 5</p>
        <p><strong>Comment:</strong> ${review.comment}</p>
        <p><strong>Date:</strong> ${new Date(
          review.date
        ).toLocaleDateString()}</p>
      `;
    reviewsSection.appendChild(reviewCard);
  });
}

async function checkAuthStatus(productId) {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    const writeReviewButtonContainer = document.getElementById(
      "write-review-button-container"
    );
    writeReviewButtonContainer.innerHTML = `<button onclick="location.href='review.html?productId=${productId}'">Write a Review</button>`;
  }
}

async function addToCart(productId) {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    try {
      const response = await fetch("/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, amount: 1 }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart in the DB.");
      }

      const result = await response.json();
      console.log(result.message); // Log success message
      updateCartCount(); // Update cart count after adding
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  } else {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = cart.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].amount += 1;
    } else {
      cart.push({ productId, amount: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    displayCartItems(); // -- Update the cart view after adding an item
  }
}

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
