import useStore from '../src/store';
import { CartItem, Product } from '../src/types';

describe('Функционал Zustand стора', () => {
  beforeEach(() => {
    useStore.setState({
      cart: [],
      products: [],
    });
  });

  test('setProducts устанавливает список продуктов', () => {
    const products: Product[] = [{ id: '1', name: 'Test Product', price: 100 }];

    useStore.getState().setProducts(products);

    expect(useStore.getState().products).to.deep.equal(products);
  });

  test('addToCart добавляет товар в корзину', () => {
    const product: CartItem = {
      id: '1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
    };

    useStore.getState().addToCart(product);

    expect(useStore.getState().cart).to.deep.equal([product]);
  });

  test('addToCart увеличивает количество, если товар уже есть в корзине', () => {
    const product: CartItem = {
      id: '1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
    };

    useStore.setState({ cart: [product] });
    useStore.getState().addToCart(product);

    expect(useStore.getState().cart[0].quantity).to.equal(2);
  });

  test('increaseQuantity увеличивает количество товара', () => {
    const product: CartItem = {
      id: '1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
    };

    useStore.setState({ cart: [product] });
    useStore.getState().increaseQuantity(product.id);

    expect(useStore.getState().cart[0].quantity).to.equal(2);
  });

  test('decreaseQuantity уменьшает количество товара', () => {
    const product: CartItem = {
      id: '1',
      name: 'Test Product',
      price: 100,
      quantity: 2,
    };

    useStore.setState({ cart: [product] });
    useStore.getState().decreaseQuantity(product.id);

    expect(useStore.getState().cart[0].quantity).to.equal(1);
  });

  test('decreaseQuantity не уменьшает количество ниже 1', () => {
    const product: CartItem = {
      id: '1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
    };

    useStore.setState({ cart: [product] });
    useStore.getState().decreaseQuantity(product.id);

    expect(useStore.getState().cart[0].quantity).to.equal(1);
  });

  test('removeFromCart удаляет товар из корзины', () => {
    const product: CartItem = {
      id: '1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
    };

    useStore.setState({ cart: [product] });
    useStore.getState().removeFromCart(product.id);

    expect(useStore.getState().cart).to.deep.equal([]);
  });
});
