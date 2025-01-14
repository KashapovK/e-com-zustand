import React, { useEffect, useState } from "react";
import Product from "./product";
import Cart from "./cart";
import products from "./mocks/products";

const App: React.FC = () => {
  const [loadedProducts, setLoadedProducts] = useState<unknown[]>([]);

  // имитация асинхронного запроса
  useEffect(() => {
    const fetchProducts = async () => {
      await new Promise((resolve) => setTimeout(resolve));
      setLoadedProducts(products);
    };

    fetchProducts();
  }, []);

  interface ProductData {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }

  const isProduct = (item: unknown): item is ProductData => {
    return (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "name" in item &&
      "price" in item &&
      typeof (item as ProductData).id === "string" &&
      typeof (item as ProductData).name === "string" &&
      typeof (item as ProductData).price === "number"
    );
  };

  const validProducts = loadedProducts.filter(isProduct) as ProductData[];

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
