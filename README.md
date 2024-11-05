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

## Prerequisites

- **Node.js** (version 14 or higher) - Download from `nodejs.org`
- **npm** (Node Package Manager), which is included with Node.js
- **MongoDB** installed and running on your local machine or hosted in the cloud (e.g., MongoDB Atlas)

## Setup Instructions

**Clone the repository:**
```bash

git clone https://github.com/VictorySolo/candy-castle.git

cd candy-castle

```
**Install dependencies:**

1.```bcrypt```

Used to securely hash passwords
```bash

npm install bcrypt

```
2. ```cookie-parser```

Allows parsing of cookies in the applicatio
```bash

npm install cookie-parser

```
3. ```cors```

Enables Cross-Origin Resource Sharing, allowing the app to communicate with resources on different origins
```bash

npm install cors

```
4. ```dotenv```

Loads environment variables from a .env file, keeping sensitive data like database credentials out of the source code
```bash

npm install dotenv

```
5. ```express```

A fast web framework for building the server and handling requests and responses
```bash

npm install express

```
6. ```express-session```

A fast web framework for building the server and handling requests and responses
```bash

npm install express-session

```
7. ```helmet```

Provides security for your Express app by setting various HTTP headers
```bash

npm install helmet

```
8. ```http-server```

A simple, zero-configuration command-line HTTP server, useful for serving static files in development
```bash

npm install http-server

```
9. ```jsonwebtoken```

Used for generating and verifying JSON Web Tokens (JWT) for secure data exchange
```bash

npm install jsonwebtoken

```
10. ```mongoose```

Connects to MongoDB and provides a schema-based solution to model your data
```bash

npm install mongoose

```
**Environment Setup:**
- Create a ```.env``` file to store environment variables, including MongoDB URI, JWT secret, etc.
- Example:
```plaintext

MONGO_URI=your_mongo_database_uri
PORT=your_local_host_path
SALT_ROUNDS=your_amount_of_a_salt_rounds
SECRET_KEY=your_secret_key 
SESSION_SECRET=your_session_secret_key
```
**Start the Application:**
```bash

npm start
```
**Access the App:**

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

