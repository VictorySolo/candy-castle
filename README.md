# Candy Castle
Candy Castle is a fullstack web application for an online candy shop. It provides a secure platform for users to browse, order candies, and manage their accounts. Built with Node.js, Express.js, MongoDB, and Mongoose, the app ensures secure transactions using Bcrypt for password and payment card number hashing, and JWT for user authentication.

## Features
- **Browse Candies**: User can view a wide variety of candies available in the shop
- **User Authentication**: Secure registration and login system using JWT
- **Payment Security**: Passwords and sensitive information are hashed using Bcrypt
- **Order Management**: Users can add items to their cart and place orders
- **Secure APIs**: All API requests are protected and secured

## Project Structure

```bash
candy-castle/
  backend/
   controllers/        # Business logic for handling requests  
     categoriesController.js
     customersController.js
     ordersController.js
     productsController.js
   dist/               # Database setup and environment variables
     .env              # Environment variables (e.g., database URI, JWT secret)
     db.js             # Database connection setup
   models/             # Mongoose models for the application
     categorie.js
     customer.js
     order.js
     product.js
   routes/             # API route definitions
     categoriesRouter.js
     customersRouter.js
     ordersRouter.js
     productsRouter.js
   services/           # Business logic services
     authentication.js # Authentication service
  frontend/
    app.js             # Main JavaScript file for frontend logic
    index.html         # Main HTML file for the shop
.gitignore             # To ignore node_modules and sensitive files
server.js              # Main server setup and configuration
