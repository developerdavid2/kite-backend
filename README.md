# kite-backend

A production-grade REST API built with Node.js, Express, and TypeScript.
Integrates with three external APIs to classify names by gender, age, and
nationality. Stores results in MongoDB with full CRUD support.

---

## Tech Stack

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| **Node.js** v18+ | Runtime                 |
| **Express** v5   | Web framework           |
| **TypeScript**   | Strict typing, no `any` |
| **Mongoose**     | MongoDB ODM             |
| **Axios**        | HTTP client             |
| **UUID v7**      | Unique profile IDs      |
| **Vercel**       | Serverless deployment   |

---

## Architecture

```
src/
├── config/         → Database connection with cache
├── models/         → Mongoose schema and model
├── routes/         → Express router definitions
├── controllers/    → Request validation and orchestration
├── services/       → External API calls and business logic
├── utils/          → Response formatting and classification helpers
├── types/          → All TypeScript interfaces
└── middleware/     → Global error handler
```

**Separation of concerns:**

- `routes/` — maps HTTP paths to controllers, nothing else
- `controllers/` — validates input, calls services, formats responses
- `services/` — all external API logic, throws typed errors
- `utils/` — pure functions, no side effects
- `types/` — single source of truth for all interfaces
- `middleware/` — catches all unhandled errors, returns correct status

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)

### Installation

```bash
git clone https://github.com/developerdavid2/kite-backend.git
cd kite-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kite-backend
PORT=3000
```

### Run Locally

```bash
npm run dev
```

Server starts at `http://localhost:3000`

---

## API Reference

### Stage 0 — Name Classification

#### `GET /api/classify?name={name}`

Calls the Genderize API and returns a processed gender prediction.

**Success Response `200`**

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-01T12:00:00Z"
  }
}
```

**Processing Rules**

- `count` from Genderize is renamed to `sample_size`
- `is_confident` = `probability >= 0.7` AND `sample_size >= 100`
- `processed_at` is generated fresh on every request via `new Date().toISOString()`

**Error Responses**

| Status | Cause                   | Message                                         |
| ------ | ----------------------- | ----------------------------------------------- |
| `400`  | Missing or empty name   | `Missing or empty name parameter`               |
| `422`  | name is not a string    | `name is not a string`                          |
| `404`  | No prediction available | `No prediction available for the provided name` |
| `502`  | Genderize API failed    | `Genderize returned an invalid response`        |
| `500`  | Unexpected error        | `Internal server error`                         |

---

### Stage 1 — Profile Management

#### `POST /api/profiles`

Calls Genderize, Agify, and Nationalize APIs in parallel and stores the
result. If the name already exists, returns the existing profile without
calling the APIs again.

**Request Body**

```json
{ "name": "ella" }
```

**Success Response `201 Created`**

```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DK",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

**Duplicate Response `200`**

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { "...existing profile..." }
}
```

---

#### `GET /api/profiles`

Returns all profiles. Supports optional case-insensitive filtering.

**Query Parameters**

| Parameter    | Type   | Example            |
| ------------ | ------ | ------------------ |
| `gender`     | string | `?gender=male`     |
| `country_id` | string | `?country_id=NG`   |
| `age_group`  | string | `?age_group=adult` |

Parameters are combinable: `?gender=male&country_id=NG&age_group=adult`

**Success Response `200`**

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "john",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "US"
    }
  ]
}
```

---

#### `GET /api/profiles/:id`

Returns a single profile by UUID.

**Success Response `200`**

```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "john",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 25,
    "age_group": "adult",
    "country_id": "US",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

---

#### `DELETE /api/profiles/:id`

Deletes a profile by UUID. Returns `204 No Content` on success.

---

## Classification Logic

### Age Groups

| Age Range | Group      |
| --------- | ---------- |
| 0 – 12    | `child`    |
| 13 – 19   | `teenager` |
| 20 – 59   | `adult`    |
| 60+       | `senior`   |

### Nationality

The country with the highest probability in the Nationalize response
array is selected as `country_id`.

---

## Error Handling

All errors follow this shape:

```json
{
  "status": "error",
  "message": ""
}
```

**External API edge cases — returns `502`, nothing is stored:**

- Genderize returns `gender: null` or `count: 0`
- Agify returns `age: null`
- Nationalize returns an empty country array

**Profile errors:**

| Status | Cause                    |
| ------ | ------------------------ |
| `400`  | Missing or empty name    |
| `422`  | name is not a string     |
| `404`  | Profile not found        |
| `502`  | Any external API failure |
| `500`  | Unexpected server error  |

---

## Testing

### Classify Endpoint

```bash
# Happy path
curl "http://localhost:3000/api/classify?name=john"

# Missing name → 400
curl "http://localhost:3000/api/classify"

# Empty name → 400
curl "http://localhost:3000/api/classify?name="

# Array name → 422
curl "http://localhost:3000/api/classify?name[]=john"

# Unknown name → 404
curl "http://localhost:3000/api/classify?name=xzqwerty"
```

### Profiles Endpoints

```bash
# Create
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": "john"}'

# Get all
curl http://localhost:3000/api/profiles

# Filter
curl "http://localhost:3000/api/profiles?gender=male&country_id=US"

# Get one
curl http://localhost:3000/api/profiles/{id}

# Delete
curl -X DELETE http://localhost:3000/api/profiles/{id}

# Duplicate
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": "john"}'

# Missing name → 400
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{}'

# Wrong type → 422
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": 123}'

# Unknown name → 502
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": "xzqwerty"}'
```

---

## Deployment

Deployed on Vercel as a serverless function.

- `api/index.ts` exports the Express app as default — Vercel handles the server
- `vercel.json` routes all traffic to `api/index.ts`

Add `MONGODB_URI` in the Vercel dashboard under
**Settings → Environment Variables**.

```bash
# Deploy via CLI
vercel

# Or push to GitHub — Vercel auto-deploys on push
git push origin main
```

---

## Environment Variables

| Variable      | Required | Description                      |
| ------------- | -------- | -------------------------------- |
| `MONGODB_URI` | ✅ Yes   | MongoDB Atlas connection string  |
| `PORT`        | ❌ No    | Local dev port (default: `3000`) |
