# Question 7: MERN Shopping Cart (Admin & User Sites, 2-Level Categories)

## Objective
Develop a full-featured Shopping Cart application using the **MERN Stack** (MongoDB, Express, React, Node.js) with:
- **2-Level Category Hierarchy**:
  - Level 1: Parent Category (e.g. *Electronics*, *Fashion & Clothing*)
  - Level 2: Subcategory (e.g. *Laptops*, *Smartphones* under Electronics)
- **Admin Site**:
  - Add Parent Categories (Level 1)
  - Add Subcategories (Level 2) associated with a parent
  - View & Delete Categories
  - Add Products (linked to parent and child categories)
  - View & Delete Products
- **User Site**:
  - Browse and filter products by Parent Category and Subcategory
  - Add products to Cart
  - Shopping Cart with quantity update (+ / -) and item removal
  - Subtotal & Grand Total calculation
  - Order Checkout simulation
- Auto-seeding: Automatically populates sample categories and products on first run for instant evaluation.

---

## File Structure
```text
Question_7/
├── package.json          # Express, Mongoose, CORS dependencies & scripts
├── server.js             # REST API for Categories, Products & Checkout
├── models/
│   ├── Category.js       # 2-level Category Schema (Parent reference + Level)
│   └── Product.js        # Product Schema (Category & Subcategory references)
└── client/               # React Frontend (Vite)
    ├── package.json      # React dependencies
    ├── vite.config.js    # Vite dev server configuration & API proxy
    ├── index.html        # HTML entry point
    └── src/
        ├── main.jsx      # React root
        └── App.jsx       # User Storefront, Cart, and Admin Management interfaces
```

---

## Step-by-Step Code Walkthrough

1. **2-Level Categories Schema (`models/Category.js`)**:
   - `level`: 1 for top-level, 2 for subcategory.
   - `parent`: `ObjectId` referencing the parent `Category` (null for level 1).

2. **Products Schema (`models/Product.js`)**:
   - References both `category` (Parent) and `subcategory` (Child) with Mongoose `populate()`.

3. **REST API Endpoints (`server.js`)**:
   - `GET /api/categories`: Returns all categories.
   - `POST /api/categories`: Inserts parent or subcategory.
   - `GET /api/products?category=...&subcategory=...`: Filters products based on selected levels.
   - `POST /api/products`: Inserts a new product.
   - `POST /api/checkout`: Simulates order placement and generates order ID.

4. **React Frontend (`client/src/App.jsx`)**:
   - Tab switcher between **User Storefront** and **Admin Site**.
   - **User View**: Allows selecting a parent category, which dynamically updates the subcategory filter. Adding products to the cart enables live quantity updates and calculates total prices in a table.
   - **Admin View**: Form to manage 2-level categories and full product CRUD in clear HTML tables.

---

## How to Install and Run

1. Make sure MongoDB is running on your machine (default port: `27017`).
2. Open terminal and navigate to the `Question_7` folder:
   ```bash
   cd Question_7
   ```

3. Install backend dependencies:
   ```bash
   npm install
   ```

4. Install client dependencies and build the React frontend:
   ```bash
   npm run build:client
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open your browser and navigate to:
   ```text
   http://localhost:3007
   ```
