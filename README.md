# Candy Castle

Welcome to **Candy Castle**, a delightful web app for candy lovers! This full-stack application lets users browse, order, and review a variety of candies with a seamless user experience.


## Project Overview

**Candy Castle** is developed using:

- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io
- **Frontend**: HTML, JavaScript, CSS
- **Security**: CORS, Helmet, Bcrypt for hashing passwords and sensitive information, JWT for authentication

## Features

- **Product Display**: Users can view a grid of products with details, ratings, and prices
- **Authentication**: Secure registration and login using JWT
- **Real-Time Updates**: Powered by Socket.io for dynamic interactions
- **Shopping Cart**: Add items to the cart and see a cart counter in the header
- **Categories**: Organized by candy types and forms
- **Responsive Design**: Adaptive for all screen sizes, providing a seamless shopping experience on any device

## Project Structure

Here's the file structure of the **Candy Castle** project:

- **backend/controllers**: Request handling logic for categories, customers, orders, and products.
- **backend/models**: Mongoose schemas and models (category, customer, order, product).
- **backend/routes**: API route definitions for easy navigation between functionalities.
- **backend/services**: Services including authentication services.
- **frontend**: JavaScript and HTML for client-side logic and presentation

## Setup Instructions
**1. Clone the repository:**
```bash

git clone https://github.com/VictorySolo/candy-castle.git
```
**2. Install dependencies:**
```bash

cd candy-castle
npm install
```
**3. Environment Setup:**
- Create a ```.env``` file to store environment variables, including MongoDB URI, JWT secret, etc.
- Example:
```env

MONGO_URI=your_mongo_database_uri
PORT=your_local_host_path
SALT_ROUNDS=your_amount_of_a_salt_rounds
SECRET_KEY=your_secret_key 
SESSION_SECRET=your_session_secret_key
```
**4. Start the Server:**
```bash

npm start
```
**5. Access the App:**

- Open your browser and navigate to ```http://localhost:3000```.

## Usage

- **Register**: Click on the "Register" button in the header to create a new account
- **Login**:Use the "Login" button to access your account
- **Browse Products**: he homepage shows a grid of available products by default
- **Shopping Cart**: Add items to the cart and see the counter update in real-time
- **Category Browsing**: Navigate by candy types or forms for an organized view

## Contributing

If you'd like to contribute, feel free to fork the repository and submit a pull request. All contributions are welcome!

## License

This project is licensed under the MIT License. See the LICENSE file for more information.

