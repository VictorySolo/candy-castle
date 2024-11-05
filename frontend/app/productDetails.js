document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed");
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
  
    if (productId) {
      await fetchProductDetails(productId);
    }
    updateCartCount();
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
  
  function displayProductDetails(product) {
    const productDetailsSection = document.getElementById("product-details");
    productDetailsSection.innerHTML = `
      <div class="product-detail-card">
        <img src="${product.imagePath || "../images/candy-shop.png"}" alt="${product.name}" class="product-detail-img">
        <h2 class="product-detail-name">${product.name}</h2>
        <p class="product-detail-description">${product.description}</p>
        <p class="product-detail-composition">Composition: ${product.composition}</p>
        <p class="product-detail-weight">Weight: ${product.weight}g</p>
        <p class="product-detail-energy">Energy: ${product.energy} kcal</p>
        <p class="product-detail-price">$${product.price.toFixed(2)}</p>
        <button onclick="addToCart('${product._id}')">Add to Cart</button>
      </div>
    `;
  }
  
  function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = cart.findIndex((item) => item.productId === productId);
  
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].amount += 1;
    } else {
      cart.push({ productId, amount: 1 });
    }
  
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
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
  