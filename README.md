# Role-Based Access Control System – TurboVets

A simplified RBAC system built for a veteran healthcare application to demonstrate secure role-based access and multi-tenant resource scoping.

---

## 1. Setup Instructions

### Requirements
- Node.js (v18+)
- npm or yarn
- SQLite (in-memory, no setup required)

### Installation
```bash
npm install
```

### Running the App
```bash
npm run start:dev
```

### Run Seed Script (prepopulates users, roles, orgs, resources)
```bash
npm run seed
```

### Running Tests
```bash
npm run test
```

---

## 2. API Documentation

### `/records` – List all accessible records
```http
GET /records?user_email=admin@hospital.com
```
Returns only those records the user has permission to access.

### `/records/:id` – View a specific record
```http
GET /records/:id?user_email=viewer@clinic.com
```
Returns a single resource if the user has read access.

### `/permissions/check` – Check permission for a user
```http
GET /permissions/check?user_email=admin@hospital.com&resource_id=123&permission=read
```
Returns `{ granted: true | false }`

### `/audit/logs` – View access attempt logs
```http
GET /audit/logs
```
Returns list of access audit entries.

---

## 3. Data Model Overview

Each organization (both parent and child) contains **three default roles**: `Owner`, `Admin`, and `Viewer`.

| Role    | Permissions                    | Scope                         |
|---------|--------------------------------|-------------------------------|
| Owner   | Create, Read, Update, Delete   | Full access in assigned org and its children |
| Admin   | Create, Read, Update, Delete   | Only within assigned organization           |
| Viewer  | Read-only                      | Assigned org + child orgs (read-only only)  |

**Example**:
- A **Viewer** in the **Main Hospital** (parent org) can **read** records in its child orgs like **Clinic A** or **Lab B**.
- But a **Viewer** in **Clinic A** cannot view records from the **Main Hospital** or sibling orgs like **Lab B**.


| Entity       | Description                                           | Relationships |
|--------------|-------------------------------------------------------|---------------|
| Organization | 2-level structure: parent and children               | ↔ Users, Resources |
| User         | Has a role and belongs to an organization            | → Role, Org    |
| Role         | Represents access level (Owner, Admin, Viewer)       | ↔ Permissions  |
| Permission   | `read`, `create`, `update`, `delete`                 | ↔ Roles        |
| Resource     | Represents patient records tied to an organization   | → Org, Owner   |

```
Organization (parent) ───┬──> Clinic A (child)
                         └──> Lab B (child)

User ──> Role ──> Permissions
     └──> Organization

Resource ──> Organization
         └──> Owner (User)
```

---

## 4. Access Control Implementation

This RBAC model assigns users to roles within their specific organization. Roles control permissions; organization defines scope.


| Rule | Description |
|------|-------------|
| ✅ Permission Check | User must have the requested permission via their Role |
| ✅ Same Org Check   | If user and resource belong to the same org → access granted |
| ✅ Parent → Child   | If user is in parent org and resource is in a direct child org → access granted |
| ❌ Child → Parent   | Access is denied if user is in a child org and tries to access parent org's resources |

Access decisions are strictly based on **role** and **org scope**, fulfilling RBAC principles.

---

## 5. Future Considerations for Data Access

### Extensibility
- Support deeper org hierarchies (more than 2 levels)
- Add temporary or delegated access via token-based rules
- Dynamic role creation via admin dashboard

### Security in Production
- Add JWT-based authentication
- Mask sensitive fields based on role
- Enforce rate-limiting, IP whitelisting, and audit trails

### Performance Optimization
- Cache user-role-permissions lookup per session
- Index org and role relations in database
- Pre-filter records at DB layer using joins

### Potential Enhancements
- Swagger/OpenAPI integration
- Admin portal for user-role-org mapping
- Support for soft delete and resource versioning
