const API_URL = process.env.API_URL || "http://localhost:8080";
const request = require("supertest");

let token;

beforeEach(async () => {
  await request(API_URL).post("/test/reset");
  const res2 = await request(API_URL).post("/test/admin");
  token = res2.body.data.token;
});

const auth = (test) => {
  return test.auth(token, { type: "bearer" });
}

const get = (url, query) => {
  if (query === undefined) {
    query = {};
  }
  return auth(request(API_URL).get(url)).query(query);
}

const post = (url, params) => {
  if (params === undefined) {
    return auth(request(API_URL).post(url))
  }
  return auth(request(API_URL).post(url)).type("form").send(params);
}

const put = (url, params) => {
  if (params === undefined) {
    return auth(request(API_URL).put(url));
  }
  return auth(request(API_URL).put(url)).type("form").send(params);
}

const del = (url) => {
  return auth(request(API_URL).delete(url));
}

describe("User tests", () => {
  test("GET /user/self returns information about logged-in user", async () => {
    const res = await get("/user/self");
    expect(res.body).toMatchObject({ status: 200 });
    const data = res.body.data;
    expect(data).toMatchObject({ name: "admin", admin: true });
  });
  test("GET /user/other returns all users", async () => {
    let res = await get("/user/other");
    expect(res.body).toMatchObject({ status: 200 });
    let data = res.body.data;
    expect(data.length).toEqual(1);
    expect(data[0]).toMatchObject({ name: "admin", admin: true });
    expect(data[0].password).not.toEqual("1234");
  });
  test("POST /user creates a new user", async () => {
    const res = await post("/user", { name: "user1", password: 2345 });
    expect(res.body).toMatchObject({ status: 201 });
  });
});
