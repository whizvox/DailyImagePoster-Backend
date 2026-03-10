const API_URL = process.env.API_URL || "http://localhost:8080";
const request = require("supertest");

describe("User tests", () => {
  test("GET /user/other returns all users", async () => {
    const res = await request(API_URL).get("/user/other");
    expect(res.body).toMatchObject({ status: 200, type: "Ok" });
    const data = res.body.data;
    expect(data.length).toBeGreaterThan(0);
  });
});
