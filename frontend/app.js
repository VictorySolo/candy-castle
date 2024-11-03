document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Main content area and buttons
    const mainContent = document.getElementById('main-content');
    // Initialize buttons
    document.getElementById('register').onclick = showRegistrationForm;
    document.getElementById('login').onclick = showLoginForm;

    // Display registration form
    function showRegistrationForm() {
        mainContent.innerHTML = `
      <div class="form-container">
        <h2>Register</h2>
        <input type="text" placeholder="First name" required>
        <input type="text" placeholder="Last name" required>
        <input type="email" placeholder="Email" required>
        <input type="password" placeholder="Password" required>
        <input type="number" placeholder="Age" required>
        <input type="tel" placeholder="Phone" required>
         <!-- Discard and Submit Buttons -->
         <div class="form-buttons">
        <button onclick="discardForm()">Discard</button>
        <button onclick="submitRegistration()">Submit</button>
        </div>
      </div>
    `;
    }

    // Function to show the login form (similar to registration)
    function showLoginForm() {
        mainContent.innerHTML = `
        <div class="form-container">
            <h2>Login</h2>
            <input type="email" placeholder="Email" required>
            <input type="password" placeholder="Password" required>
            <div class="form-buttons">
                <button onclick="discardForm()">Discard</button>
                <button onclick="submitLogin()">Login</button>
            </div>
        </div>
    `;
    }

    // Function to discard the form (go back to main content)
    function discardForm() {
        mainContent.innerHTML = `
        <h1>Welcome to Candy Castle!</h1>
        <p>Explore our wide selection of sweets and candies!</p>
        <div id="product-grid" class="product-grid"></div>
    `;

        // Re-fetch and display products
        fetchProducts();
    }

    async function submitRegistration() {
        // Gather input values
        const firstName = document.querySelector('input[placeholder="First name"]').value;
        const lastName = document.querySelector('input[placeholder="Last name"]').value;
        const email = document.querySelector('input[placeholder="Email"]').value;
        const password = document.querySelector('input[placeholder="Password"]').value;
        const age = document.querySelector('input[placeholder="Age"]').value;
        const phone = document.querySelector('input[placeholder="Phone"]').value;

        // Create a user object
        const userData = {
            firstName,
            lastName,
            email,
            password,
            age,
            phone,
        };

        try {
            // Send the data to the server
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Check if the registration was successful
            if (response.ok) {
                alert("Registration successful!");
                discardForm();  // Go back to the main page to view products
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const error = await response.json();
                alert(`Registration failed: ${error.message}`);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('An error occurred during registration. Please try again.');
        }
    }
})