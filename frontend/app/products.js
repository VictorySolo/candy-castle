document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  fetchProducts();
  updateCartCount();
  displayCartItems(); // -- Call displayCartItems when the page loads
});

async function fetchProducts() {
  try {
    console.log("Fetching products...");
    const response = await fetch("/products");
    const products = await response.json();
    console.log("Fetched products:", products);

    // Fetch ratings for each product
    for (let product of products) {
      try {
        const ratingResponse = await fetch(`/reviews?productId=${product._id}`);
        if (!ratingResponse.ok) {
          throw new Error(
            `Failed to fetch reviews for productId ${product._id}`
          );
        }
        const reviews = await ratingResponse.json();
        product.rating =
          reviews.length > 0 ? calculateAverageRating(reviews) : 0;
      } catch (error) {
        console.error(
          `Error fetching reviews for productId ${product._id}:`,
          error
        );
        product.rating = 0; // Default rating if reviews fetch fails or no reviews found
      }
    }
    // -- filtering out unavailable products
    const availableProducts = products.filter(
      (product) => product.availability
    );
    displayProducts(availableProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function displayProducts(products) {
  const productGrid = document.getElementById("product-grid");
  productGrid.innerHTML = ""; // Clear any existing content

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <div class="product-info" onclick="viewProductDetails('${product._id}')">
        <img src="${product.imagePath || "../images/candy-shop.png"}" alt="${
      product.name
    }" class="product-img">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-rating">
          ${generateRatingStars(product.rating)}
        </div>
        <p class="product-price">$${product.price.toFixed(2)}</p>
      </div>
      <img src="./images/plus.png" alt="Add to Cart" class="add-to-cart-icon" onclick="addToCart('${
        product._id
      }')">
    `;

    productGrid.appendChild(productCard);
  });
}

function viewProductDetails(productId) {
  window.location.href = `product.html?id=${productId}`;
}

function generateRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStars = rating % 1 !== 0 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return ` ${'<span class="star-full">&#9733;</span>'.repeat(
    fullStars
  )} ${'<span class="star-half">&#9733;</span>'.repeat(
    halfStars
  )} ${'<span class="star-empty">&#9734;</span>'.repeat(emptyStars)} `;
}

function calculateAverageRating(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
}

// -- Add product to cart
async function addToCart(productId) {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  if (authData.loggedIn) {
    // If logged in, add to cart in the database
    try {
      const response = await fetch("/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, amount: 1 }), // Add item to the cart with default amount 1
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
    // If not logged in, add to cart in the local storage
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

// -- Update cart count in the UI
async function updateCartCount() {
  const authResponse = await fetch("/isLoggedIn");
  const authData = await authResponse.json();

  let cart = [];

  if (authData.loggedIn) {
    try {
      const cartResponse = await fetch("/cart");
      if (cartResponse.status === 200) {
        const cartData = await cartResponse.json();
        if (cartData.items) {
          cart = cartData.items; // Use cart items from DB if logged in
        }
      } else if (cartResponse.status === 404) {
        // Handle case where cart is not found
        console.log("No cart found for the user.");
      } else {
        console.error("Failed to fetch cart data:", cartResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  } else {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }

  const cartCount = cart.reduce((total, item) => total + item.amount, 0);
  document.getElementById("cart-count").textContent = cartCount;
}

// -- Display cart items in the UI
function displayCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("cart-items");

  if (!cartItemsContainer) {
    return; // If the cart page is not loaded
  }

  cartItemsContainer.innerHTML = ""; // Clear any existing content

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <p>Product ID: ${item.productId}</p>
      <p>Amount: ${item.amount}</p>
    `;

    cartItemsContainer.appendChild(cartItem);
  });
}
