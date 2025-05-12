import { render, screen, waitFor } from '@testing-library/react';
import { assert } from 'chai';
import App from '../src/app';
import useStore from '../src/store';

describe('App Component (Zustand)', () => {
  beforeEach(() => {
    useStore.setState({
      products: [
        { id: '1', name: 'Test Product', price: 100 },
        { id: '2', name: 'Another Product', price: 200 },
      ],
      cart: [],
    });
  });

  test('рендерит карточки продуктов после загрузки продуктов', async () => {
    render(<App />);

    assert.exists(screen.getByText(/Интернет-магазин/i));

    await waitFor(() => {
      assert.isAbove(screen.getAllByText(/Добавить в корзину/i).length, 0);
    });
  });
});
