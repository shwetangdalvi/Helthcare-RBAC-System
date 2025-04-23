# Role-Based Access Control System – TurboVets

A simplified RBAC system built for a veteran healthcare application to demonstrate secure role-based access and multi-tenant resource scoping.

### Organizational Structure Diagram

![Editor _ Mermaid Chart-2025-04-22-202815](https://github.com/user-attachments/assets/ac1b7c1b-5cc3-4e6e-bc16-ebfc6a760d0b)

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
### Run Seed Script (prepopulates users, roles, orgs, resources)

```bash
npm run seed
```

### Running the App

```bash
npm run start:dev
```

### Running Tests

```bash
npm run test
```

**Postman Collection Included**: A Postman collection is provided to test all endpoints.

### Postman Setup:
1. Open Postman
2. Import the provided `healthcare-rbac-system.postman_collection.json`
3. Replace email and resource ID values as per seeded data (already added in collection)

Includes:

- Role-based seed script
- Unit test cases with Jest
- ESLint for code linting and style consistency

---

## 2. API Documentation
**Note: If there is no user in the database, then the system will respond with 403 permission denied. (We can create users by a seed script.)
        The seed script only creates the required users and resources for testing.

Dev Environment: http://localhost:3000/
 
### `/records` – List all accessible records

Case: Owner - Level 1
```http
GET /records?user_email=owner@hospital.com
```
Returns only those records the user has permission to access. (in owner of level 1 case all)

Case: Owner - Level 2
```http
GET /records?user_email=viewer@pediatrics.com
```
Returns only those records the user has permission to access. (in owner of level 2 case only level 2 records)

### `/records/:id` – View a specific record
```http
GET /records/uuid-record-radiology-1?user_email=viewer@radiology.com
```
Returns a single resource if the user has read access.

### `/permissions/check` – Check permission for a user
```http
GET /permissions/check?user_email=admin@radiology.com&resource_id=uuid-record-radiology-1&permission=update
```
Returns `{ granted: true | false }`

### `/audit/logs` – View access attempt logs
```http
GET /audit/logs
```
Returns list of access audit entries.

---

## 3. Data Model Overview

### Diagrams:
- ![Editor _ Mermaid Chart-2025-04-21-031534](https://github.com/user-attachments/assets/1437889d-b8ae-40a4-9ef0-1ccc0f7e27c7)

### Entity Descriptions

- **User**: Represents an individual user. Each user is assigned a role and belongs to one organization.
- **Organization**: Hierarchical structure allowing parent-child relationships between healthcare units.
- **Role**: Represents a type of user (e.g., Admin, Viewer, Owner) and controls which permissions a user has.
- **Permission**: Defines actions like read, create, update, delete.

Each organization (both parent and child) contains **three default roles**: `Owner`, `Admin`, and `Viewer`.

| Role   | Permissions                  | Scope                                          |
|--------|------------------------------|------------------------------------------------|
| Owner  | Create, Read, Update, Delete | Full access in assigned org and its children   |
| Admin  | Create, Read, Update         | Manage access in assigned org and its children |
| Viewer | Read-only                    | View Access in assigned org and its children |

**Example**:

- A **Viewer** in the **Main Hospital** can **only view** records from their own organization and child organization.
- An **Admin** in **Clinic A** can manage records within **Clinic A**.
- An **Owner** in **Main Hospital** can create, view, and update records across **Main Hospital**, **Clinic A**, and **Lab B**.

| Entity       | Description                                        | Relationships      |
|--------------|----------------------------------------------------|--------------------|
| Organization | 2-level structure: parent and children             | ↔ Users, Resources |
| User         | Has a role and belongs to an organization          | → Role, Org        |
| Role         | Represents access level (Owner, Admin, Viewer)     | ↔ Permissions      |
| Permission   | `read`, `create`, `update`, `delete`               | ↔ Roles            |
| Resource     | Represents patient records tied to an organization | → Org, Owner       |

---

## 4. Access Control Implementation

The RBAC system uses organizational scoping and role-based permissions to control access. The logic is centralized in the `AccessControlService`.

### Core Enforcement Flow:

1. **Role Permissions Check** – Verifies the user's role includes the requested permission.
2. **Organization Scope** –
   - Access is granted if the user and resource are in the same organization.
   - If the user is in a **parent org** (e.g., Main Hospital) and the resource belongs to a **child org** (e.g., Clinic A), access is conditionally granted based on role.
   - A **child org** user (e.g., Clinic A) cannot access resources in the parent org or sibling orgs.
3. **Role Enforcement** –
   - `Owner`: Full control within assigned org + children
   - `Admin`: Manage content within own org (and optionally child orgs, based on config)
   - `Viewer`: Read-only access within assigned org only

The logic is easily extendable and follows separation of concerns.

---

## 5. Future Considerations for Data Access

### Extensibility

- Support deeper org hierarchies (more than 2 levels)
- Add temporary or delegated access via token-based rules
- Dynamic role creation via admin dashboard
- Add audit logging to a persistent store (database or file-based)
- Add Crud operations other than GET for records

### Best Security Practices in Healthcare Data

- Encrypt all personally identifiable information (PII) at rest and in transit
- Use JWT-based authentication with access tokens scoped to role and organization
- Leverage virtual private networks (VPNs) to secure internal API access
- Implement strict rate limiting, input validation, and error sanitization
- Use a HIPAA-compliant cloud provider or security vendor for data hosting
- Maintain access audit trails, store and monitor them regularly

### Performance Optimization

- Cache user-role-permissions lookup per session
- Index org and role relations in database
- Pre-filter records at DB layer using joins

### Potential Enhancements

- Swagger/OpenAPI integration
- Admin portal for user-role-org mapping
- Support for soft delete and resource versioning

---

## Tech Stack

- **NestJS** – Backend Framework
- **TypeORM** – ORM for SQLite
- **SQLite** – In-memory DB for quick testing
- **Jest** – Unit and integration testing
- **ESLint** – Linting and code style enforcement
- **TypeScript** – Strong typing and structure
