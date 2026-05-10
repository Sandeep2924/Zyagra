import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider }    from "./context/AuthContext";
import { CartProvider }    from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext"; // ← NEW

import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import HomePage      from "./pages/HomePage";
import ProductList   from "./pages/ProductList";
import LoginPage     from "./pages/LoginForm";
import SignUpPage    from "./pages/SignUpPage";
import AboutPage     from "./pages/AboutPage";
import ContactPage   from "./pages/ContactPage";
import WishlistPage  from "./pages/WishlistPage";
import Cart          from "./pages/Cart";
import CheckoutPage  from "./pages/CheckoutPage";
import MyOrdersPage  from "./pages/MyOrdersPage";
import ProfilePage   from "./pages/ProfileForm";
import SupportPage   from "./pages/SupportFarmersPage";

import AdminLoginPage  from "./pages/AdminLoginPage";
import AdminRoute      from "./components/AdminRoute";
import AdminDashboard  from "./components/AdminDashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/*
          ProductProvider wraps CartProvider so that:
          - ProductContext is available everywhere (home, product list, admin)
          - CartContext can also access product data if needed
          - Any admin change (add/delete/stock) immediately updates the
            same ProductContext that the user-facing pages read from
        */}
        <ProductProvider>
          <CartProvider>
            <Navbar />
            <Routes>
              <Route path="/"         element={<HomePage />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/signup"   element={<SignUpPage />} />
              <Route path="/about"    element={<AboutPage />} />
              <Route path="/contact"  element={<ContactPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart"     element={<Cart />} />
              <Route path="/myorders" element={<MyOrdersPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile"  element={<ProfilePage />} />
              <Route path="/support"  element={<SupportPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
            <Footer />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
