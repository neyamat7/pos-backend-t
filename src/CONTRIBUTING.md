# Generate Express Router with Swagger Documentation

## Stack

- Node.js ES6 modules (import/export)
- Express.js router
- Swagger JSDoc (OpenAPI 3.0)
- MongoDB with Mongoose
- API base: `/api/v1`

---

## Generate This Structure

```javascript
import express from "express";
import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "./FEATURE.controller.js";

const router = express.Router();

// 1. DEFINE SCHEMAS
/**
 * @swagger
 * components:
 *   schemas:
 *     ModelName:
 *       type: object
 *       required: [field1, field2]
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         field1:
 *           type: string
 *           example: Sample
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// 2. DEFINE TAG
/**
 * @swagger
 * tags:
 *   name: TagName
 *   description: Description here
 */

// 3. DOCUMENT ROUTES
/**
 * @swagger
 * /api/v1/resource:
 *   get:
 *     summary: Get all items
 *     tags: [TagName]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ModelName'
 */
router.get("/", getAll);

// POST, GET/:id, PUT/:id, DELETE/:id (same pattern)

export default router;
```

---

## Response Format

**Success:**

```json
{
  "status": "success",
  "data": {},
  "message": "Optional message"
}
```

**Error:**

```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## Common Types

```
type: string, integer, number, boolean, array, object
format: date-time, email, password, float
enum: [value1, value2]
```

---

## My Request

Generate router for: **[FEATURE NAME]**

**Fields:**

- field1: type - description
- field2: type - description
- field3: type - description

**Routes:**

- GET /api/v1/resource (all with pagination)
- GET /api/v1/resource/:id (by ID)
- POST /api/v1/resource (create)
- PUT /api/v1/resource/:id (update)
- DELETE /api/v1/resource/:id (delete)

**Additional routes:** [if any]

**Query filters:** [if any]

---

## Requirements

- Use ES6 import/export
- Complete Swagger schemas
- All CRUD routes documented
- Include examples
- Use `/api/v1/` prefix
- MongoDB `_id` format
- Response codes: 200, 201, 400, 404, 500
