const endpointsJson = require("../endpoints.json");
const app = require("../api/api");
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const request = require('supertest');
const sorted = require("jest-sorted");

beforeAll(() => seed(data));
afterAll(() => db.end());


describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: if i can access all of the topics ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({body}) => {
        expect(body.topics).toHaveLength(3);
      });
  });
  test("404: error bad request", () => {
    return request(app)
      .get("/api/error")
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toEqual("404: Not Found");
      });
});
})
