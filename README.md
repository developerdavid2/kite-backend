# kite-backend

A production-grade Node.js + Express + TypeScript API that predicts gender based on a given name using the Genderize API.

## Tech Stack

- **Node.js** (v18+) - Runtime environment
- **Express** (v5.2.1) - Web framework
- **TypeScript** (v6.0.2) - Static type safety
- **Axios** (v1.15.0) - HTTP client
- **Vercel** - Serverless deployment platform

## Architecture Overview

The application follows a layered architecture with clear separation of concerns:

```
src/
├── routes/        → Express Router definitions
├── controllers/   → Request handlers and orchestration
├── services/      → Business logic and external API calls
├── utils/         → Helper functions (response formatting)
├── types/         → TypeScript interfaces and type definitions
└── middleware/    → Global error handling
```

**Separation of Concerns:**

- **routes/** - Maps HTTP methods and paths to controllers. No business logic.
- **controllers/** - Orchestrates the request flow. Validates input, calls services, formats responses using utility functions. No try/catch—all errors propagate via `next(error)`.
- **services/** - Pure business logic. Handles external API calls (Genderize). Throws typed errors for downstream handling. No `req`/`res` objects.
- **utils/** - Reusable pure functions. Response builders ensure consistent API response shapes across all endpoints.
- **types/** - Single source of truth for all TypeScript interfaces. No `any` types. Includes: `GenderizeApiResponse` (raw API), `ClassifyResult` (processed response), `ApiSuccessResponse<T>` (generic wrapper), `ApiErrorResponse` (error wrapper).
- **middleware/** - Global error handler. Catches all unhandled errors, distinguishes between API failures (502) and server errors (500), logs with timestamp.

## Getting Started

### Prerequisites

- Node.js v18 or later
- npm v9 or later

### Installation

```bash
git clone https://github.com/yourusername/kite-backend.git
cd kite-backend
npm install
```

### Running Locally

```bash
npm run dev
```

The server starts at `http://localhost:3000` by default. Set `PORT` environment variable to use a different port.

## API Reference

### Endpoint

```
GET /api/classify?name={name}
```

### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-13T14:30:45.123Z"
  }
}
```

### Error Responses

**400 Bad Request** — Missing or empty `name` parameter

```json
{
  "status": "error",
  "message": "Missing or empty name parameter"
}
```

**422 Unprocessable Entity** — `name` is not a string (e.g., array, number)

```json
{
  "status": "error",
  "message": "name is not a string"
}
```

**404 Not Found** — Genderize API returns `gender: null` or `count: 0`

```json
{
  "status": "error",
  "message": "No prediction available for the provided name"
}
```

**502 Bad Gateway** — Genderize API unreachable or failed

```json
{
  "status": "error",
  "message": "Failed to fetch gender prediction from Genderize API"
}
```

**500 Internal Server Error** — Unexpected server error

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

### Response Field Reference

| Field               | Type    | Description                                            |
| ------------------- | ------- | ------------------------------------------------------ |
| `status`            | string  | Always `"success"` for 200, `"error"` for failure      |
| `data`              | object  | Response payload (only present on success)             |
| `data.name`         | string  | The name provided in the query parameter               |
| `data.gender`       | string  | Predicted gender: `"male"` or `"female"`               |
| `data.probability`  | number  | Confidence score between 0 and 1                       |
| `data.sample_size`  | number  | Sample count from Genderize API (renamed from `count`) |
| `data.is_confident` | boolean | `true` if probability ≥ 0.7 AND sample_size ≥ 100      |
| `data.processed_at` | string  | ISO 8601 timestamp when request was processed (UTC)    |
| `message`           | string  | Error message (only present on failure)                |

## Processing Logic

### Field Transformation

The Genderize API returns a `count` field. This is renamed to `sample_size` in the response for clarity.

### Confidence Calculation

The `is_confident` field is computed as:

```
is_confident = (probability >= 0.7) AND (sample_size >= 100)
```

**Both conditions must be true.** If either fails, `is_confident` is `false`.

### Processed Timestamp

The `processed_at` field is generated on every single request using `new Date().toISOString()`. It is **not** cached and represents when the server processed the request in UTC.

## Error Handling

The application uses a global error middleware that catches all unhandled errors from controllers and services.

**Error Flow:**

1. **Controllers** validate input and call services synchronously.
2. **Services** throw typed errors on API failures (`GenderizeApiError`).
3. **Controllers** propagate errors via `next(error)` instead of try/catch.
4. **Error Middleware** catches all errors and determines HTTP status:
   - `GenderizeApiError` → **502 Bad Gateway** (upstream API failure)
   - Any other error → **500 Internal Server Error**
5. All errors are logged with an ISO 8601 timestamp for debugging.

**HTTP Status Codes:**

| Status | Cause                                  | Handling                       |
| ------ | -------------------------------------- | ------------------------------ |
| 200    | Successfully predicted gender          | Return `ClassifyResult`        |
| 400    | Missing or empty `name` parameter      | Controller validation          |
| 422    | `name` is not a string or is an array  | Controller validation          |
| 404    | Genderize returns `null` or `count: 0` | Controller checks API response |
| 502    | Genderize API unreachable              | Error middleware               |
| 500    | Unexpected error (uncaught exception)  | Error middleware               |

## Testing the API

### Happy Path — Valid Name

```bash
curl "http://localhost:3000/api/classify?name=john"
```

Expected: 200 success response with male gender prediction.

### Missing Name Parameter

```bash
curl "http://localhost:3000/api/classify"
```

Expected: 400 "Missing or empty name parameter"

### Empty Name

```bash
curl "http://localhost:3000/api/classify?name="
```

Expected: 400 "Missing or empty name parameter"

### Array Name (Invalid Type)

```bash
curl "http://localhost:3000/api/classify?name[]=john"
```

Expected: 422 "name is not a string"

### Unknown Name (No Prediction Available)

```bash
curl "http://localhost:3000/api/classify?name=xyzabc123notaname"
```

Expected: 404 "No prediction available for the provided name"

## Deployment

### Vercel

Deploy to Vercel with zero configuration:

```bash
npm install -g vercel
vercel login
vercel
```

**vercel.json** Configuration:

The `vercel.json` file specifies:

- **builds** — Compiles `api/index.ts` using `@vercel/node` runtime
- **routes** — Routes all requests (`/(.*)` ) to the serverless function at `api/index.ts`
- **version** — Vercel platform version 2

The serverless entry point (`api/index.ts`) imports and re-exports the Express app from `src/app.ts`. No changes to application code are required for deployment.

### Build and Start Commands

```bash
npm run build  # Compiles TypeScript to dist/
npm start      # Runs the compiled JavaScript on local machine
```

## Environment

**No environment variables required.** The API works out of the box.

**External Dependencies:**

- **api.genderize.io** — GraphQL and REST API for gender prediction based on name. Requests are made via `https://api.genderize.io?name={name}`. No API key required.
