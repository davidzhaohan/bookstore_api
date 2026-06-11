# Bookstore REST API

A Java-based RESTful API for managing a bookstore's book inventory. Books can be created, read, updated, and deleted with role-based access control.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** (Hibernate ORM)
- **Spring Security** (Basic Auth, role-based access)
- **H2** in-memory database
- **Maven**

## Data Model

### Book

| Field     | Type            | Description              |
| --------- | --------------- | ------------------------ |
| `isbn`    | string          | ISBN (unique identifier) |
| `title`   | string          | Book title               |
| `authors` | array of Author | Book author(s)           |
| `year`    | int             | Publication year         |
| `price`   | double          | Price                    |
| `genre`   | string          | Genre                    |

### Author

| Field      | Type          | Description                |
| ---------- | ------------- | -------------------------- |
| `name`     | string        | Author name                |
| `birthday` | string (date) | Date of birth (yyyy-MM-dd) |

A book is uniquely identified by its ISBN and can have one or more authors.

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.6+

### Build & Run

```bash
# Build the project
mvn clean package

# Run the application
java -jar target/bookstore-api-0.0.1-SNAPSHOT.jar

# Or run directly with Maven
mvn spring-boot:run
```

The server starts on `http://localhost:8080`. On startup, 8 sample books are pre-loaded into the database.

### H2 Console

The H2 database console is available at `http://localhost:8080/h2-console` (no authentication required). Use `jdbc:h2:mem:bookstore` as the JDBC URL.

## Authentication

All API endpoints (except the H2 console) require HTTP Basic Authentication. Two users are configured:

| Username | Password | Role  | Permissions                           |
| -------- | -------- | ----- | ------------------------------------- |
| `user`   | `user`   | USER  | Add, update, search books             |
| `admin`  | `admin`  | ADMIN | Add, update, search, **delete** books |

## API Endpoints

### Add a Book

```http
POST /api/books
```

**Request body:**

```json
{
  "isbn": "978-0-316-76948-0",
  "title": "The Catcher in the Rye",
  "authors": [{ "name": "J.D. Salinger", "birthday": "1919-01-01" }],
  "year": 1951,
  "price": 14.99,
  "genre": "Coming-of-Age"
}
```

**Response:** `201 Created`

```json
{
  "isbn": "978-0-316-76948-0",
  "title": "The Catcher in the Rye",
  "authors": [{ "name": "J.D. Salinger", "birthday": "1919-01-01" }],
  "year": 1951,
  "price": 14.99,
  "genre": "Coming-of-Age"
}
```

### Update a Book

```http
PUT /api/books/{isbn}
```

Replaces all fields of the book identified by `{isbn}`. Requires the same JSON body as POST.

**Response:** `200 OK`

### Search Books

```http
GET /api/books
GET /api/books?title=1984
GET /api/books?author=George Orwell
GET /api/books?title=Animal Farm&author=George Orwell
```

All parameters are optional. Without parameters, returns all books. Searches use **exact match**.

**Response:** `200 OK` with an array of Book objects.

### Delete a Book

```http
DELETE /api/books/{isbn}
```

**Restricted to ADMIN role only.** USER role requests receive `403 Forbidden`.

**Response:** `204 No Content`

## Error Responses

| Status             | Meaning                                      |
| ------------------ | -------------------------------------------- |
| `400 Bad Request`  | Validation failure (missing/ invalid fields) |
| `401 Unauthorized` | Missing or invalid credentials               |
| `403 Forbidden`    | Insufficient role permissions                |
| `404 Not Found`    | Book with given ISBN does not exist          |
| `409 Conflict`     | Duplicate ISBN on create                     |

Error response body format:

```json
{
  "timestamp": "2026-06-11T15:42:07.120386",
  "status": 409,
  "error": "Conflict",
  "message": "Book with ISBN 978-0-316-76948-0 already exists"
}
```

## Example Usage (curl)

```bash
# List all books (authenticated as user)
curl -u user:user http://localhost:8080/api/books

# Search books by title
curl -u user:user "http://localhost:8080/api/books?title=1984"

# Search books by author
curl -u user:user "http://localhost:8080/api/books?author=George%20Orwell"

# Search by both title and author
curl -u user:user "http://localhost:8080/api/books?title=Animal%20Farm&author=George%20Orwell"

# Add a new book
curl -u user:user -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0-316-76948-0",
    "title": "The Catcher in the Rye",
    "authors": [{"name": "J.D. Salinger", "birthday": "1919-01-01"}],
    "year": 1951,
    "price": 14.99,
    "genre": "Coming-of-Age"
  }'

# Update a book
curl -u user:user -X PUT http://localhost:8080/api/books/978-0-316-76948-0 \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0-316-76948-0",
    "title": "The Catcher in the Rye (Updated)",
    "authors": [{"name": "J.D. Salinger", "birthday": "1919-01-01"}],
    "year": 1951,
    "price": 19.99,
    "genre": "Classic"
  }'

# Delete a book (ADMIN only)
curl -u admin:admin -X DELETE http://localhost:8080/api/books/978-0-316-76948-0

# Attempt delete with USER role (fails with 403)
curl -u user:user -X DELETE http://localhost:8080/api/books/978-0-316-76948-0
```
