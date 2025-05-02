# NC News Seeding

# NC News API

**Live Demo:** https://nc-news-api-dk0u.onrender.com/api

## Overview

NC News API is a RESTful service for managing articles, topics, users, and comments. It supports advanced features such as sorting, filtering, and pagination on the `/api/articles` endpoint, as well as full CRUD operations on comments. The backend is built with Node.js, Express, and PostgreSQL, and is hosted on Render.

## Features

- **Topics**: Retrieve all topics
- **Articles**:
  - List all articles with optional `sort_by`, `order`, and `topic` filters
  - Get a single article by ID (includes `comment_count`)
- **Comments**:
  - List comments for a given article
  - Post a new comment
  - Delete a comment
- **Users**: Retrieve all users
- **Voting**: Increment or decrement an article's votes

## Project Structure

```
├── api
│   ├── api.js
│   ├── controller
│   │   └── nc_news.controller.js
│   └── model
│       └── nc_news.model.js
├── db
│   ├── connection.js
│   ├── setup-dbs.sql
│   └── seeds
│       └── run-seed.js
├── __tests__
│   ├── app.test.js
│   ├── seed.test.js
│   └── utils.test.js
├── .env.development
├── .env.production
├── endpoints.json
├── package.json
└── README.md
```

## Prerequisites

- **Node.js** v14.x or higher
- **PostgreSQL** 12.x or higher
- **Yarn** or **npm**

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/northcoders/be-nc-news.git
cd be-nc-news
```

### 2. Install dependencies

Using Yarn:
```bash
yarn install
```

Or using npm:
```bash
npm install
```

### 3. Set up local databases

Run the SQL script to create development and test databases:

```bash
npm run setup-dbs
```  
This executes **db/setup-dbs.sql**:
```sql
DROP DATABASE IF EXISTS nc_news;
CREATE DATABASE nc_news;

DROP DATABASE IF EXISTS nc_news_test;
CREATE DATABASE nc_news_test;
```

### 4. Configure environment variables

Create your `.env.development` file:
```bash
# .env.development
PGDATABASE=nc_news
```

Create your `.env.production` file (add to `.gitignore`):
```bash
# .env.production
DATABASE_URL=postgresql://postgres.dffgzhlvqwvdvardwxjc:jAS5RxPmk3r6Vsu6@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
NODE_ENV=production
```

### 5. Seed the database

```bash
npm run seed
```

### 6. Run tests

```bash
npm test
```

### 7. Start the server

```bash
npm start
```
By default it listens on port `9090`. You can change this in `listen.js` or set the `PORT` environment variable.

## Available Scripts

- `npm run setup-dbs` — create development & test databases
- `npm run seed` — seed development database
- `npm run seed-prod` — seed production database (`NODE_ENV=production`)
- `npm test` — run Jest test suite
- `npm start` — start the API server

## API Documentation

All endpoints and examples are documented in **endpoints.json**. To view them, send a GET request to:

```
GET /api
```

or open the `endpoints.json` file in the project root.

## Deployment

This app is deployed on Render:
1. Connect your GitHub repo in Render dashboard
2. Set **Build Command** to `yarn` (or `npm install`)
3. Set **Start Command** to `yarn start` (or `npm start`)
4. Add environment variables in Render:
   - `DATABASE_URL` = your Supabase URI
   - `NODE_ENV` = `production`
5. Deploy and monitor logs under **Events** → **Logs**

---

