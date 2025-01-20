import { fakerRU as faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

const generateProducts = (count: number) => {
  return Array.from({ length: count }, () => ({
    id: uuidv4(),
    name: faker.commerce.product(),
    price: faker.number.int({ min: 100, max: 10000 }),
  }));
};

const products = generateProducts(1000);

export default products;
