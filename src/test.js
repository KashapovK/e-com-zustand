import puppeteer from "puppeteer";
import XLSX from "xlsx";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const timeout = 3000;
  page.setDefaultTimeout(timeout);

  await page.goto("http://localhost:5173");

  const results = [];

  // Функция для замера времени рендеринга и объема памяти
  const measurePerformance = async (actionDescription, action) => {
    const startTime = performance.now();

    const memoryBefore = await page.evaluate(
      () => performance.memory.usedJSHeapSize,
    );

    await action();

    const endTime = performance.now();

    const memoryAfter = await page.evaluate(
      () => performance.memory.usedJSHeapSize,
    );

    results.push({
      action: actionDescription,
      renderTime: endTime - startTime - 500,
      memoryUsage: memoryAfter - memoryBefore,
    });

    console.log(
      `${actionDescription} - Время рендеринга: ${endTime - startTime - 500} мс`,
    );
    console.log(`Используемая память: ${memoryAfter - memoryBefore} байт`);
  };

  // Измерение времени рендеринга и добавление случайных 10 продуктов в корзину
  const products = await page.$$(".product-card");
  if (products.length === 0) {
    console.error("Продукты не найдены!");
    await browser.close();
    return;
  }

  // Выбор случайных продуктов
  const randomProducts = [];
  for (let i = 0; i < 20; i++) {
    const randomIndex = Math.floor(Math.random() * products.length);
    randomProducts.push(products[randomIndex]);
  }

  for (const product of randomProducts) {
    const addToCartButton = await product.$(".add-to-cart-button");
    await measurePerformance("Добавление продукта в корзину", async () => {
      await addToCartButton.click();
      await page.waitForNetworkIdle(100);
    });
  }

  await page.waitForSelector(".cart-container");
  const cartItems = await page.$$(".cart-item");

  if (cartItems.length > 0) {
    for (let i = 0; i < cartItems.length; i++) {
      const increaseButton = await cartItems[i].$(
        ".quantity-controls .quantity-button:nth-child(3)",
      ); // Кнопка "+"

      for (let j = 0; j < 10; j++) {
        await measurePerformance("Увеличение количества товара", async () => {
          await increaseButton.click();
          await page.waitForNetworkIdle(100);
        });
      }
    }

    // Уменьшение количества каждого товара в корзине на 10
    for (let i = 0; i < cartItems.length; i++) {
      const decreaseButton = await cartItems[i].$(
        ".quantity-controls .quantity-button:nth-child(1)",
      ); // Кнопка "-"

      for (let j = 0; j < 10; j++) {
        await measurePerformance("Уменьшение количества товара", async () => {
          await decreaseButton.click();
          await page.waitForNetworkIdle(100);
        });
      }
    }

    // Удаление каждого товара из корзины
    for (let i = 0; i < cartItems.length; i++) {
      const removeButton = await cartItems[i].$(".remove-button");
      if (removeButton) {
        await measurePerformance("Удаление товара из корзины", async () => {
          await removeButton.click();
          await page.waitForNetworkIdle(100);
        });
      } else {
        console.error("Кнопка удаления не найдена!");
      }
    }
  } else {
    console.error(
      "Корзина пуста, товары не найдены для изменения количества или удаления.",
    );
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(results);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  XLSX.writeFile(workbook, "performance_results.xlsx");

  await browser.close();
})();
