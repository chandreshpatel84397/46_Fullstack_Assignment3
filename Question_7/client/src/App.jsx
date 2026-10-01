import React, { useState, useEffect } from 'react';

export default function App() {
  const [viewMode, setViewMode] = useState('user'); // 'user' or 'admin'
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Storefront Filter States
  const [selectedParentCat, setSelectedParentCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');

  // Cart State (stored locally in state)
  const [cart, setCart] = useState([]);
  const [orderConfirmation, setOrderConfirmation] = useState('');

  // Admin Form States: Add Parent Category
  const [newParentCatName, setNewParentCatName] = useState('');

  // Admin Form States: Add Subcategory
  const [subCatParentId, setSubCatParentId] = useState('');
  const [newSubCatName, setNewSubCatName] = useState('');

  // Admin Form States: Add Product
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdParentCat, setNewProdParentCat] = useState('');
  const [newProdSubCat, setNewProdSubCat] = useState('');

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch Products with optional category filtering
  const fetchProducts = async (catId = '', subId = '') => {
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (catId) params.append('category', catId);
      if (subId) params.append('subcategory', subId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Filter products when user selects category or subcategory
  const handleParentFilterChange = (parentId) => {
    setSelectedParentCat(parentId);
    setSelectedSubCat('');
    fetchProducts(parentId, '');
  };

  const handleSubFilterChange = (subId) => {
    setSelectedSubCat(subId);
    fetchProducts(selectedParentCat, subId);
  };

  // Helper arrays for 2-level categories
  const parentCategories = categories.filter((c) => c.level === 1);
  const getSubcategoriesOf = (parentId) => {
    return categories.filter((c) => c.level === 2 && c.parent && c.parent._id === parentId);
  };

  // ==========================================================
  // CART OPERATIONS
  // ==========================================================
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product._id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Your cart is empty!');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total: cartTotal })
      });
      const data = await res.json();
      if (data.success) {
        setOrderConfirmation(`Thank you! ${data.message}`);
        setCart([]);
      }
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    }
  };

  // ==========================================================
  // ADMIN OPERATIONS
  // ==========================================================
  const handleAddParentCategory = async (e) => {
    e.preventDefault();
    if (!newParentCatName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newParentCatName })
      });
      if (res.ok) {
        setNewParentCatName('');
        fetchCategories();
      }
    } catch (err) {
      alert('Error creating category');
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubCatName || !subCatParentId) return alert('Select parent category and name!');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubCatName, parent: subCatParentId })
      });
      if (res.ok) {
        setNewSubCatName('');
        fetchCategories();
      }
    } catch (err) {
      alert('Error creating subcategory');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete category and all its subcategories?')) return;
    try {
      await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      fetchCategories();
      fetchProducts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdParentCat || !newProdSubCat) {
      return alert('Please fill in all product fields.');
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          price: newProdPrice,
          description: newProdDesc,
          stock: newProdStock,
          category: newProdParentCat,
          subcategory: newProdSubCat
        })
      });
      if (res.ok) {
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDesc('');
        fetchProducts();
        alert('Product added successfully!');
      }
    } catch (err) {
      alert('Error adding product');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '30px' }}>
      {/* HEADER / NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '12px' }}>
        <h2>MERN Shopping Cart with 2-Level Categories</h2>
        <div>
          <button
            onClick={() => setViewMode('user')}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              fontWeight: viewMode === 'user' ? 'bold' : 'normal',
              backgroundColor: viewMode === 'user' ? '#007bff' : '#f0f0f0',
              color: viewMode === 'user' ? '#fff' : '#000',
              border: '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            User Storefront ({cart.reduce((c, i) => c + i.quantity, 0)} Items)
          </button>
          <button
            onClick={() => setViewMode('admin')}
            style={{
              padding: '8px 16px',
              fontWeight: viewMode === 'admin' ? 'bold' : 'normal',
              backgroundColor: viewMode === 'admin' ? '#28a745' : '#f0f0f0',
              color: viewMode === 'admin' ? '#fff' : '#000',
              border: '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            Admin Site (Categories & Products)
          </button>
        </div>
      </div>

      {/* ==========================================================
          USER STOREFRONT VIEW
          ========================================================== */}
      {viewMode === 'user' && (
        <div style={{ marginTop: '20px' }}>
          <h3>User Storefront - Browse Products by Category</h3>

          {orderConfirmation && (
            <div style={{ background: '#d4edda', color: '#155724', padding: '12px', border: '1px solid #c3e6cb', marginBottom: '15px' }}>
              <strong>Order Placed!</strong> {orderConfirmation}
            </div>
          )}

          {/* 2-Level Category Filters */}
          <div style={{ background: '#f8f9fa', padding: '15px', border: '1px solid #ddd', marginBottom: '20px' }}>
            <strong>Filter by 2-Level Categories:</strong>
            <br /><br />
            <label>Level 1 (Parent Category): </label>
            <select
              value={selectedParentCat}
              onChange={(e) => handleParentFilterChange(e.target.value)}
              style={{ padding: '6px', marginRight: '20px' }}
            >
              <option value="">-- All Categories --</option>
              {parentCategories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <label>Level 2 (Subcategory): </label>
            <select
              value={selectedSubCat}
              onChange={(e) => handleSubFilterChange(e.target.value)}
              disabled={!selectedParentCat}
              style={{ padding: '6px' }}
            >
              <option value="">-- All Subcategories --</option>
              {selectedParentCat &&
                getSubcategoriesOf(selectedParentCat).map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
            </select>
          </div>

          {/* Products Table */}
          <h4>Available Products</h4>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th>Product Name</th>
                <th>Parent Category</th>
                <th>Subcategory</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category ? p.category.name : '-'}</td>
                    <td>{p.subcategory ? p.subcategory.name : '-'}</td>
                    <td>{p.description}</td>
                    <td>${p.price}</td>
                    <td>{p.stock}</td>
                    <td>
                      <button
                        onClick={() => addToCart(p)}
                        style={{ padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                      >
                        Add to Cart
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" align="center">No products found in this category.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Shopping Cart Section */}
          <div style={{ marginTop: '35px' }}>
            <h3>Your Shopping Cart</h3>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ background: '#f2f2f2' }}>
                  <th>Item</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <tr key={item.product._id}>
                      <td>{item.product.name}</td>
                      <td>${item.product.price}</td>
                      <td>
                        <button onClick={() => updateCartQuantity(item.product._id, -1)} style={{ padding: '2px 8px' }}>-</button>
                        <span style={{ margin: '0 10px', fontWeight: 'bold' }}>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product._id, 1)} style={{ padding: '2px 8px' }}>+</button>
                      </td>
                      <td>${item.product.price * item.quantity}</td>
                      <td>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" align="center">Your cart is currently empty.</td>
                  </tr>
                )}
                {cart.length > 0 && (
                  <tr>
                    <td colSpan="3" align="right"><strong>Total Amount:</strong></td>
                    <td colSpan="2"><strong style={{ color: '#28a745', fontSize: '17px' }}>${cartTotal}</strong></td>
                  </tr>
                )}
              </tbody>
            </table>

            {cart.length > 0 && (
              <div style={{ marginTop: '15px', textAlign: 'right' }}>
                <button
                  onClick={handleCheckout}
                  style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '15px' }}
                >
                  Proceed to Checkout ($ {cartTotal})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================
          ADMIN SITE VIEW
          ========================================================== */}
      {viewMode === 'admin' && (
        <div style={{ marginTop: '20px' }}>
          <h3>Admin Site - Manage 2-Level Categories & Products</h3>

          {/* Section A: Category Management */}
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
            {/* Form 1: Add Parent Category */}
            <div style={{ flex: '1', minWidth: '300px', border: '1px solid #ccc', padding: '15px' }}>
              <h4>1. Add Parent Category (Level 1)</h4>
              <form onSubmit={handleAddParentCategory}>
                <label>Category Name:</label><br />
                <input
                  type="text"
                  value={newParentCatName}
                  onChange={(e) => setNewParentCatName(e.target.value)}
                  placeholder="e.g. Sports & Outdoors"
                  required
                  style={{ width: '90%', padding: '6px', margin: '8px 0' }}
                />
                <br />
                <button type="submit" style={{ padding: '6px 14px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Create Parent Category
                </button>
              </form>
            </div>

            {/* Form 2: Add Subcategory */}
            <div style={{ flex: '1', minWidth: '300px', border: '1px solid #ccc', padding: '15px' }}>
              <h4>2. Add Subcategory (Level 2)</h4>
              <form onSubmit={handleAddSubcategory}>
                <label>Select Parent Category:</label><br />
                <select
                  value={subCatParentId}
                  onChange={(e) => setSubCatParentId(e.target.value)}
                  required
                  style={{ width: '95%', padding: '6px', margin: '8px 0' }}
                >
                  <option value="">-- Select Parent --</option>
                  {parentCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <br />
                <label>Subcategory Name:</label><br />
                <input
                  type="text"
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  placeholder="e.g. Running Shoes"
                  required
                  style={{ width: '90%', padding: '6px', margin: '8px 0' }}
                />
                <br />
                <button type="submit" style={{ padding: '6px 14px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Create Subcategory
                </button>
              </form>
            </div>
          </div>

          {/* List of Categories in Table */}
          <h4>Existing Categories & Subcategories</h4>
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '30px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th>Category Name</th>
                <th>Level</th>
                <th>Parent Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.level === 1 ? 'Level 1 (Parent)' : 'Level 2 (Subcategory)'}</td>
                  <td>{c.parent ? c.parent.name : 'None (Top Level)'}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteCategory(c._id)}
                      style={{ padding: '3px 8px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Section B: Product Management */}
          <h4>3. Add New Product</h4>
          <form onSubmit={handleAddProduct} style={{ border: '1px solid #ccc', padding: '15px', maxWidth: '650px', marginBottom: '25px' }}>
            <table border="0" cellPadding="6" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td><label>Product Name:</label></td>
                  <td>
                    <input
                      type="text"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      required
                      style={{ width: '90%', padding: '6px' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>Parent Category (Level 1):</label></td>
                  <td>
                    <select
                      value={newProdParentCat}
                      onChange={(e) => {
                        setNewProdParentCat(e.target.value);
                        setNewProdSubCat('');
                      }}
                      required
                      style={{ width: '95%', padding: '6px' }}
                    >
                      <option value="">-- Select Parent Category --</option>
                      {parentCategories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td><label>Subcategory (Level 2):</label></td>
                  <td>
                    <select
                      value={newProdSubCat}
                      onChange={(e) => setNewProdSubCat(e.target.value)}
                      disabled={!newProdParentCat}
                      required
                      style={{ width: '95%', padding: '6px' }}
                    >
                      <option value="">-- Select Subcategory --</option>
                      {newProdParentCat &&
                        getSubcategoriesOf(newProdParentCat).map((sub) => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td><label>Price ($):</label></td>
                  <td>
                    <input
                      type="number"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      min="1"
                      required
                      style={{ width: '90%', padding: '6px' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>Stock Count:</label></td>
                  <td>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      min="0"
                      required
                      style={{ width: '90%', padding: '6px' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>Description:</label></td>
                  <td>
                    <textarea
                      rows="2"
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      style={{ width: '90%', padding: '6px' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" align="center">
                    <button type="submit" style={{ padding: '8px 18px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Save Product
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          {/* Admin Products List Table */}
          <h4>Existing Products in Database</h4>
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th>Product Name</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category ? p.category.name : '-'}</td>
                  <td>{p.subcategory ? p.subcategory.name : '-'}</td>
                  <td>${p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      style={{ padding: '3px 8px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
