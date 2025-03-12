import { render, screen, waitFor } from '@testing-library/react';
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

    expect(screen.getByText(/Интернет-магазин/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/Добавить в корзину/i).length).toBeGreaterThan(
        0,
      );
    });
  });
});
