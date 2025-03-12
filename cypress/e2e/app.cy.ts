describe('E-com App', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('отображает заголовок магазина', () => {
    cy.contains('Интернет-магазин').should('be.visible');
  });

  it('корзина пуста при загрузке', () => {
    cy.contains('Корзина')
      .parent()
      .contains('Корзина пуста')
      .should('be.visible');
  });

  it('добавляет товар в корзину', () => {
    cy.get('button.add-to-cart-button').should('exist').first().click();
    cy.contains('Корзина').parent().find('.cart-item').should('exist');
  });

  it('добавляет другой товар в корзину', () => {
    cy.get('button.add-to-cart-button')
      .should('have.length.at.least', 2)
      .as('addButtons');

    cy.get('@addButtons').eq(0).click();
    cy.get('@addButtons').eq(1).click();

    cy.get('.cart-item').should('have.length', 2);
  });

  it('увеличивает количество товара в корзине', () => {
    cy.get('button.add-to-cart-button').first().click();
    cy.get('.cart-item').within(() => {
      cy.get('.quantity-button').contains('+').click();
      cy.get('.item-quantity').should('contain', '2');
    });
  });

  it('уменьшает количество товара в корзине', () => {
    cy.get('button.add-to-cart-button').first().click();
    cy.get('.cart-item').within(() => {
      cy.get('.quantity-button').contains('+').click().click();
      cy.get('.item-quantity').should('contain', '3');
      cy.get('.quantity-button').contains('-').click();
      cy.get('.item-quantity').should('contain', '2');
    });
  });

  it('удаляет товар из корзины', () => {
    cy.get('button.add-to-cart-button').first().click();
    cy.get('.cart-item').should('exist');
    cy.get('.cart-item').within(() => {
      cy.get('.remove-button').click();
    });
    cy.contains('Корзина').parent().find('.cart-item').should('not.exist');
  });
});
