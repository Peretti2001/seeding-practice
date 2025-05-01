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
  test("200: responds with an array of topic objects each having slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
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

describe("GET /api/articles/:article_id", () => {
  test("200: responds with the correct article object for a valid ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const article = body.article;

        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        });
      });
  });

  test("404: responds with 'Article not found' for non-existent ID", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404: Not Found");
      });
  });

  test("400: responds with 'bad request' for invalid ID", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of article objects with correct fields, sorted by created_at descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;

        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);

        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number)
            })
          );
          expect(article).not.toHaveProperty("body");
        });

        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: posts a new comment and returns it", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "I love this article!"
      })
      .expect(201)
      .then(({ body }) => {
        const comment = body.comment;
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: "I love this article!",
            article_id: 1,
            author: "butter_bridge",
            votes: 0,
            created_at: expect.any(String)
          })
        );
      });
  });

  test("400: missing fields", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge" }) // missing body
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing required fields");
      });
  });

  test("400: invalid article_id", () => {
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send({ username: "butter_bridge", body: "test" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });

  test("404: article does not exist", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send({ username: "butter_bridge", body: "test" })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  test("404: username does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "ghost_user", body: "test" })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
});

describe('PATCH /api/articles/:article_id', () => {
  test('200: increments votes and returns updated article', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body }) => {
        const art = body.article;
        expect(art.article_id).toBe(1);
        expect(art.votes).toBeDefined();
        expect(typeof art.votes).toBe('number');
      });
  });

  test('400: missing inc_votes in body', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Missing required field: inc_votes');
      });
  });

  test('400: inc_votes not a number', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 'five' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('inc_votes must be a number');
      });
  });

  test('400: invalid article_id', () => {
    return request(app)
      .patch('/api/articles/not-a-number')
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('bad request');
      });
  });

  test('404: article does not exist', () => {
    return request(app)
      .patch('/api/articles/9999')
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Article not found');
      });
  });
});
describe('DELETE /api/comments/:comment_id', () => {
  test('204: successfully deletes a comment', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204);
  });

  test('400: invalid comment_id', () => {
    return request(app)
      .delete('/api/comments/not-a-number')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('bad request');
      });
  });

  test('404: comment does not exist', () => {
    return request(app)
      .delete('/api/comments/9999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Comment not found');
      });
  });
});
describe('GET /api/users', () => {
  test('200: responds with an array of user objects', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String)
            })
          );
        });
      });
  });

  test('404: invalid path under /api/users returns 404', () => {
    return request(app)
      .get('/api/users/invalid')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('404: Not Found');
      });
  });
});

describe('GET /api/articles with queries', () => {
  test('200: sorts by title ascending', () => {
    return request(app)
      .get('/api/articles?sort_by=title&order=ASC')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('title', { ascending: true });
      });
  });

  test('200: sorts by votes descending', () => {
    return request(app)
      .get('/api/articles?sort_by=votes&order=DESC')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('votes', { descending: true });
      });
  });

  test('400: invalid sort_by query', () => {
    return request(app)
      .get('/api/articles?sort_by=notacolumn')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('invalid sort_by');
      });
  });

  test('400: invalid order query', () => {
    return request(app)
      .get('/api/articles?order=sideways')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('invalid order');
      });
  });
});



