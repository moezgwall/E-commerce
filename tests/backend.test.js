// Example using Jest + Supertest
const request = require("supertest");
const app = require("../server");

describe("Basic API tests", () => {
  it("should fetch products", async () => {
    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(200);
  });
});
