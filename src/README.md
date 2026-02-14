## POS Inventory Backend

- Install the dependencies: `pnpm install`
- Start the development server: `pnpm run dev`
- Server is running at `http://localhost:8000`
- API DOC: [http://localhost:8000/docs/](http://localhost:8000/docs/)
- ERD Live: [https://dbdiagram.io/d/pos-68f8bbba357668b73213217e](https://dbdiagram.io/d/pos-68f8bbba357668b73213217e)

---

### Quick Links

- **Flow Chart (ERD):** [doc/flow-chart/ERD.png](doc/flow-chart/flow-chart.png)
- **DB Diagram Folder:** [doc/db/](doc/db/)

## .env

```env
MONGO_URI=
PORT=8000
API_VERSION=/api/v1
AUTH_SECRET=abd6451176c8b9a18518bee9dd0eb733
```

---

## Git Branching & Commit Standards

### 1. Creating and Managing Branches

**Create a new branch:**

```bash
git checkout -b feature/your-feature-name
```

**Switch to another branch:**

```bash
git checkout develop
```

**Delete a branch (locally and remotely):**

```bash
git branch -d feature/your-feature-name      # delete local branch
git push origin --delete feature/your-feature-name  # delete remote branch
```

<br />

### 2. Express Feature Generator

Automates creating feature folders with boilerplate files for Express + Mongoose projects.

## Run

```bash
pnpm generate <feature-name>
```

**Example:**

```bash
pnpm generate user
```

## What It Creates

```
src/features/user/
  ├── user.model.js      # Mongoose schema
  ├── user.controller.js # Request handlers
  ├── user.services.js   # Business logic
  └── user.router.js     # Express routes
```

### 3. Industry Standard Branch Naming Convention

| Branch Type   | Prefix     | Example                       |
| ------------- | ---------- | ----------------------------- |
| Feature       | `feature/` | `feature/add-user-auth`       |
| Fix           | `fix/`     | `fix/login-error`             |
| Hotfix        | `hotfix/`  | `hotfix/critical-payment-bug` |
| Release       | `release/` | `release/v1.2.0`              |
| Documentation | `docs/`    | `docs/update-readme`          |
| Chore         | `chore/`   | `chore/update-dependencies`   |

---

### 4. Commit Message Guidelines

Follow the **Conventional Commits** standard:

**Format:**

```
<type>(<scope>): <short description>
```

**Examples:**

```bash
git commit -m "feat(auth): add JWT authentication middleware"
git commit -m "fix(api): correct response format for product route"
git commit -m "docs(readme): update setup instructions"
git commit -m "chore(deps): bump express version to 4.19.2"
```

**Common Commit Types:**

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation changes
- `style`: code formatting (no logic change)
- `refactor`: code restructuring
- `test`: adding or updating tests
- `chore`: maintenance tasks

---
