import puppeteer from 'puppeteer';
import XLSX from 'xlsx';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const timeout = 3000;
  page.setDefaultTimeout(timeout);

  let totalMemoryUsage = 0;
  let totalRenderTime = 0;
  let operationCount = 0;
  const allResults = [];
  let minMemoryUsage = Infinity;
  let maxMemoryUsage = 0;

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

    let memoryUsage = memoryAfter - memoryBefore;

    // Если использование памяти отрицательное, знак меняется на положительный
    if (memoryUsage < 0) {
      memoryUsage = -memoryUsage;
    }

    if (memoryAfter < minMemoryUsage) {
      minMemoryUsage = memoryAfter;
    }
    if (memoryAfter > maxMemoryUsage) {
      maxMemoryUsage = memoryAfter;
    }

    return { renderTime: endTime - startTime - 500, memoryUsage };
  };

  for (let testRun = 1; testRun <= 10; testRun++) {
    console.log(`Запуск теста ${testRun}...`);

    await page.goto('http://localhost:5173');

    const results = [];

    // Измерение времени рендеринга и добавление случайных 10 продуктов в корзину
    const products = await page.$$('.product-card');
    if (products.length === 0) {
      console.error('Продукты не найдены!');
      await browser.close();
      return;
    }

    // Выбор случайных продуктов
    const uniqueProducts = new Set();
    while (uniqueProducts.size < 10) {
      const randomIndex = Math.floor(Math.random() * products.length);
      uniqueProducts.add(products[randomIndex]);
    }

    for (const product of uniqueProducts) {
      const addToCartButton = await product.$('.add-to-cart-button');
      for (let i = 0; i < 1; i++) {
        const performanceResult = await measurePerformance(
          'Добавление продукта в корзину',
          async () => {
            await addToCartButton.click();
            await page.waitForNetworkIdle(100);
          },
        );

        if (performanceResult) {
          results.push({
            action: 'Добавление продукта в корзину',
            renderTime: performanceResult.renderTime,
            memoryUsage: performanceResult.memoryUsage,
          });

          totalMemoryUsage += performanceResult.memoryUsage;
          totalRenderTime += performanceResult.renderTime;
          operationCount++;
        }
      }
    }

    await page.waitForSelector('.cart-container');
    const cartItems = await page.$$('.cart-item');

    if (cartItems.length > 0) {
      for (let i = 0; i < cartItems.length; i++) {
        const increaseButton = await cartItems[i].$(
          '.quantity-controls .quantity-button:nth-child(3)',
        ); // Кнопка "+"

        for (let j = 0; j < 10; j++) {
          const performanceResult = await measurePerformance(
            'Увеличение количества товара',
            async () => {
              await increaseButton.click();
              await page.waitForNetworkIdle(100);
            },
          );

          if (performanceResult) {
            results.push({
              action: 'Увеличение количества товара',
              renderTime: performanceResult.renderTime,
              memoryUsage: performanceResult.memoryUsage,
            });

            totalMemoryUsage += performanceResult.memoryUsage;
            totalRenderTime += performanceResult.renderTime;
            operationCount++;
          }
        }
      }

      // Уменьшение количества каждого товара в корзине на 10
      for (let i = 0; i < cartItems.length; i++) {
        const decreaseButton = await cartItems[i].$(
          '.quantity-controls .quantity-button:nth-child(1)',
        ); // Кнопка "-"

        for (let j = 0; j < 10; j++) {
          const performanceResult = await measurePerformance(
            'Уменьшение количества товара',
            async () => {
              await decreaseButton.click();
              await page.waitForNetworkIdle(100);
            },
          );

          if (performanceResult) {
            results.push({
              action: 'Уменьшение количества товара',
              renderTime: performanceResult.renderTime,
              memoryUsage: performanceResult.memoryUsage,
            });

            totalMemoryUsage += performanceResult.memoryUsage;
            totalRenderTime += performanceResult.renderTime;
            operationCount++;
          }
        }
      }

      // Удаление каждого товара из корзины
      for (let i = 0; i < cartItems.length; i++) {
        const removeButton = await cartItems[i].$('.remove-button');
        if (removeButton) {
          const performanceResult = await measurePerformance(
            'Удаление товара из корзины',
            async () => {
              await removeButton.click();
              await page.waitForNetworkIdle(100);
            },
          );

          if (performanceResult) {
            results.push({
              action: 'Удаление товара из корзины',
              renderTime: performanceResult.renderTime,
              memoryUsage: performanceResult.memoryUsage,
            });

            totalMemoryUsage += performanceResult.memoryUsage;
            totalRenderTime += performanceResult.renderTime;
            operationCount++;
          }
        } else {
          console.error('Кнопка удаления не найдена!');
        }
      }
    } else {
      console.error(
        'Корзина пуста, товары не найдены для изменения количества или удаления.',
      );
    }

    allResults.push(...results); // Сохранение результатов текущего теста
  }

  // Запись результатов в Excel после всех тестов
  if (operationCount > 0) {
    const averageMemoryUsage = totalMemoryUsage / operationCount;
    const averageRenderTime = totalRenderTime / operationCount;

    // Создание данных для записи в Excel
    const excelData = [
      [
        'Описание операции',
        'Время рендеринга (мс)',
        'Используемая память (байт)',
      ],
      ...allResults.map((result) => [
        result.action,
        result.renderTime,
        result.memoryUsage,
      ]),
      ['Средние значения', averageRenderTime, averageMemoryUsage],
      ['Наименьшее использование памяти', minMemoryUsage],
      ['Наибольшее использование памяти', maxMemoryUsage],
    ];

    // Создание рабочей книги и листа
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, 'performance_results.xlsx');
  }

  await browser.close();
})();
