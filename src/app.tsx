import React, { useEffect, useState } from "react";
import Product from "./product";
import Cart from "./cart";
import products from "./mocks/products";
import CartItem from "./types/types";

const App: React.FC = () => {
  const [loadedProducts, setLoadedProducts] = useState<unknown[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      await new Promise((resolve) => setTimeout(resolve));
      setLoadedProducts(products);
    };

    fetchProducts();
  }, []);

  const isProduct = (item: unknown): item is CartItem => {
    return (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "name" in item &&
      "price" in item &&
      typeof (item as CartItem).id === "string" &&
      typeof (item as CartItem).name === "string" &&
      typeof (item as CartItem).price === "number"
    );
  };

  const validProducts = loadedProducts.filter(isProduct) as CartItem[];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Интернет-магазин</h1>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {validProducts.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
      <Cart />
    </div>
  );
};

export default App;
