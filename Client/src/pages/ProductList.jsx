import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";

import { useLocation } from "react-router-dom";

// Mock data simulating fetched products

const mockProductGroups = [
  {
    categoryName: "Fresh Vegetables",
    products: [
      {
        id: 1,
        name: "Fresh Tomatoes",
        price:  45,
        image: "/pictures/vegetables/tomato.jpg",
      },
      {
        id: 2,
        name: "Organic Spinach",
        price: 55,
        image: "/pictures/vegetables/spinach.jpg",
      },
      {
        id: 3,
        name: "Onions (Pyaz)",
        price: 30,
        image: "/pictures/vegetables/onion.jpg",
      },
      {
        id: 4,
        name: "Potatoes (Aloo)",
        price: 25,
        image: "/pictures/vegetables/potato.jpg",
      },
      {
        id: 5,
        name: "Cauliflower",
        price: 40,
        image: "/pictures/vegetables/culiflower.jpg",
      },
      {
        id: 6,
        name: "Cucumber",
        price: 20,
        image: "/pictures/vegetables/cucumber.jpg",
      },
    ],
  },
  {
    categoryName: "Fresh Fruits",
    products: [
      {
        id: 7,
        name: "Apples (Royal Gala)",
        price: 150,
        image: "/pictures/fruits/apple.jpg",
      },
      {
        id: 8,
        name: "Bananas",
        price: 60,
        image: "/pictures/fruits/banana.jpg",
      },
      {
        id: 9,
        name: "Pomegranate",
        price: 120,
        image: "/pictures/fruits/pomrgranate.jpg",
      },
      {
        id: 10,
        name: "Grapes (Green)",
        price: 80,
        image: "/pictures/fruits/grapes(green).jpg",
      },
      {
        id: 11,
        name: "Oranges",
        price: 90,
        image: "/pictures/fruits/orange.jpg",
      },
    ],
  },
  {
    categoryName: "Dairy & Bakery",
    products: [
      {
        id: 12,
        name: "Fresh Milk",
        price: 32,
        image: "/pictures/dairy/milk.jpg",
      },
      {
        id: 13,
        name: "Farm Fresh Eggs",
        price: 70,
        image: "/pictures/dairy/eggs.jpg",      },
      {
        id: 14,
        name: "Cheese",
        price: 250,
        image: "/pictures/dairy/cheese.jpg",
      },
      {
        id: 15,
        name: "Brown Bread",
        price: 45,
        image: "/pictures/dairy/bread.jpg",
      },
      {
        id: 16,
        name: "Butter",
        price: 52,
        image: "/pictures/dairy/pexels-monserratsoldu-3821250.jpg",
      },
    ],
  },
  {
    categoryName: "Pantry Staples",
    products: [
      {
        id: 17,
        name: "Atta",
        price: 220,
        image: "/pictures/pantry/aata.jpg",
      },
      {
        id: 18,
        name: "Salt",
        price: 25,
        image: "/pictures/pantry/salt.jpg",
      },
      {
        id: 19,
        name: "Soyabean Oil",
        price: 135,
        image: "/pictures/pantry/oil.jpg",
      },
      {
        id: 20,
        name: " Rice",
        price: 150,
        image: "/pictures/pantry/rice.jpg",
      },
      {
        id: 21,
        name: "Toor Dal",
        price: 140,
        image: "/pictures/pantry/dal.jpg",
      },
    ],
  },
  {
    categoryName: "Snacks & Beverages",
    products: [
      {
        id: 22,
        name: "Chips",
        price: 20,
        image: "/pictures/home page/chips.jpg",
      },
      
      {
        id: 25,
        name: "Orange Juice",
        price: 110,
        image: "/pictures/home page/juice.jpg",
      },
      
    ],
  },
  {
    categoryName: "Personal Care",
    products: [
      {
        id: 27,
        name: "Moisturizer",
        price: 180,
        image: "/pictures/personal care/moistuariser.jpg",
      },
      {
        id: 28,
        name: "Toothpaste",
        price: 95,
        image: "/pictures/personal care/toothpaste.jpg",
      },
      {
        id: 29,
        name: "Conditioner",
        price: 120,
        image: "/pictures/personal care/conditioner.jpg",
      },
      {
        id: 30,
        name: "Soap",
        price: 50,
        image: "/pictures/personal care/soap.jpg",
      },
    ],
  },
];

const ProductList = () => {
  const location = useLocation();
const initialCategory = location.state?.selectedCategory || "All";
  const [productGroups, setProductGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory); // NEW: State for category filter

  useEffect(() => {
    setTimeout(() => {
      setProductGroups(mockProductGroups);
      setLoading(false);
    }, 1000);
  }, []);

  // NEW: Get a list of category names for the filter buttons
  const categories = [
    "All",
    ...mockProductGroups.map((group) => group.categoryName),
  ];

  // NEW: Combined filtering logic
  const filteredProductGroups = productGroups
    .filter(
      (group) =>
        selectedCategory === "All" || group.categoryName === selectedCategory
    ) // First, filter by category
    .map((group) => {
      // Then, filter products within the selected categories by search term
      const filteredProducts = group.products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { ...group, products: filteredProducts };
    })
    .filter((group) => group.products.length > 0); // Finally, only keep groups that still have products

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", padding: "2rem" }}>
        Loading products...
      </h2>
    );
  }
  
  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Our Products
      </h1>

      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <input
          type="text"
          placeholder="Search for any product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "50%",
            maxWidth: "600px",
            padding: "12px 20px",
            fontSize: "16px",
            borderRadius: "50px",
            border: "2px solid #ddd",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#2C7A7B")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
        />
      </div>

      {/* NEW: Category Filter Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                borderRadius: "50px",
                border: "2px solid #2C7A7B",
                backgroundColor: isActive ? "#2C7A7B" : "white",
                color: isActive ? "white" : "#2C7A7B",
                fontWeight: isActive ? "bold" : "normal",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filteredProductGroups.length > 0 ? (
        filteredProductGroups.map((group) => (
          <div key={group.categoryName} style={{ marginBottom: "3rem" }}>
            <h2
              style={{
                marginLeft: "2rem",
                borderBottom: "2px solid #2C7A7B",
                display: "inline-block",
                paddingBottom: "0.5rem",
              }}
            >
              {group.categoryName}
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "2rem",
                marginTop: "1.5rem",
              }}
            >
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h3>No products found</h3>
          <p>Please try a different search or category.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
