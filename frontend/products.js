document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    fetchProducts();
});

async function fetchProducts() {
    try {
        console.log('Fetching products...');
        const response = await fetch('/products');
        const products = await response.json();
        console.log('Fetched products:', products);

        // Fetch ratings for each product
        for (let product of products) {
            const ratingResponse = await fetch(`/reviews?productId=${product._id}`);
            const reviews = await ratingResponse.json();
            product.rating = calculateAverageRating(reviews);
        }

        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function displayProducts(products) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = ''; // Clear any existing content

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            <img src="${product.imageUrl || './images/default-product.png'}" alt="${product.name}" class="product-img">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-rating">
                ${generateRatingStars(product.rating)}
            </div>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <img src="./images/plus.png" alt="Add to Cart" class="add-to-cart-icon" onclick="addToCart('${product._id}')">
        `;

        productGrid.appendChild(productCard);
    });
}

function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 !== 0 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return `${'&#9733;'.repeat(fullStars)}${'&#9733;'.repeat(halfStars)}${'&#9734;'.repeat(emptyStars)}`;
}

function calculateAverageRating(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
}
