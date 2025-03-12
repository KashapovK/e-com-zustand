import React, { useEffect } from 'react';
import Product from './product';
import Cart from './cart';
import useStore from './store';
import products from './mocks/products';
import { CartItem } from './types';

const App: React.FC = () => {
  const setProducts = useStore((state) => state.setProducts);
  const validProducts = useStore((state) => state.products);

  useEffect(() => {
    const fetchProducts = async () => {
      await new Promise((resolve) => setTimeout(resolve));

      setProducts(products);
    };

    fetchProducts();
  }, [setProducts]);

  const isProduct = (item: unknown): item is CartItem => {
    return (
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'name' in item &&
      'price' in item &&
      typeof (item as CartItem).id === 'string' &&
      typeof (item as CartItem).name === 'string' &&
      typeof (item as CartItem).price === 'number'
    );
  };

  const filteredProducts = validProducts.filter(isProduct) as CartItem[];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Интернет-магазин</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {filteredProducts.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
      <Cart />
    </div>
  );
};

export default App;
