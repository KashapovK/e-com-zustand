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
      renderTime: endTime - startTime,
      memoryUsage: memoryAfter - memoryBefore,
    });

    console.log(
      `${actionDescription} - Время рендеринга: ${endTime - startTime} мс`,
    );
    console.log(`Используемая память: ${memoryAfter - memoryBefore} байт`);
  };

  // Измерение времени рендеринга и добавление первого продукта в корзину несколько раз
  const products = await page.$$(".product-card");
  if (products.length === 0) {
    console.error("Продукты не найдены!");
    await browser.close();
    return;
  }

  for (let i = 0; i < 5; i++) {
    const addToCartButton = await products[0].$(".add-to-cart-button");
    await measurePerformance("Добавление продукта в корзину", async () => {
      await addToCartButton.click();
      await page.waitForNetworkIdle(100);
    });
  }

  // Увеличение и уменьшение количества товара в корзине
  await page.waitForSelector(".cart-container");
  const cartItems = await page.$$(".cart-item");

  if (cartItems.length > 0) {
    const increaseButton = await cartItems[0].$(
      ".quantity-controls .quantity-button:nth-child(3)",
    ); // Кнопка "+"
    const decreaseButton = await cartItems[0].$(
      ".quantity-controls .quantity-button:nth-child(1)",
    ); // Кнопка "-"

    for (let i = 0; i < 3; i++) {
      await measurePerformance("Увеличение количества товара", async () => {
        await increaseButton.click();
        await page.waitForNetworkIdle(100);
      });
    }

    for (let i = 0; i < 2; i++) {
      await measurePerformance("Уменьшение количества товара", async () => {
        await decreaseButton.click();
        await page.waitForNetworkIdle(100);
      });
    }

    // Удаление товара из корзины
    const removeButton = await cartItems[0].$(".remove-button");
    if (removeButton) {
      await measurePerformance("Удаление товара из корзины", async () => {
        await removeButton.click();
        await page.waitForNetworkIdle(100);
      });
    } else {
      console.error("Кнопка удаления не найдена!");
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
