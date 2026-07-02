# Frontend API Documentation

Base URL: `/api`

All protected endpoints require an Authorization header:

```http
Authorization: Bearer <token>
```

You can also send `token` or `x-auth-token` in the headers.

---

## 1. Authentication

### 1.1 Signup
- Method: `POST`
- Path: `/api/signup`
- Description: Create a new user account.

Request body:
```json
{
  "userid": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Validation rules:
- `userid` is required and trimmed.
- `name` is required.
- `email` is required.
- `password` must be at least 8 characters.

Success response:
```json
{
  "token": "<jwt>",
  "user": {
    "userid": "johndoe",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 1.2 Login
- Method: `POST`
- Path: `/api/login`
- Description: Authenticate an existing user.

Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Success response:
```json
{
  "token": "<jwt>",
  "user": {
    "userid": "johndoe",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 2. User Profile

### 2.1 Get Profile
- Method: `GET`
- Path: `/api/auth/prof`
- Auth required: Yes
- Description: Returns the logged-in user's profile.

Success response:
```json
{
  "userid": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "musics": ["<musicId1>", "<musicId2>"],
  "likes": ["<musicId3>"]
}
```

### 2.2 Update Password
- Method: `PATCH`
- Path: `/api/auth/up`
- Auth required: Yes
- Description: Change the logged-in user's password.

Request body:
```json
{
  "oldpass": "password123",
  "newpass": "newpassword123"
}
```

Success response:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 2.3 Delete Account
- Method: `DELETE`
- Path: `/api/auth/del`
- Auth required: Yes
- Description: Deletes the authenticated user.

Success response:
```json
{
  "message": "Deleted"
}
```

---

## 3. Music

### 3.1 Upload Music
- Method: `POST`
- Path: `/api/auth/musics/upload`
- Auth required: Yes
- Description: Upload a new music entry.
- Form-data: `file` and `info` and `genre`.

Request form-data:
```text
file: <binary audio/file>
info: "Chill beats"
genre: ["pop", "edm"]
```

Notes:
- `info` is required and must be a non-empty string.
- `genre` must be an array with at least one valid genre value.
- The uploaded file is uploaded to Cloudinary (the server uses the `CLOUDINARY_URL` environment variable) and stored remotely; the response includes file metadata such as `url`, `public_id`, `format`, and `size`.

Success response:
```json
{
  "_id": "<musicId>",
  "info": "Chill beats",
  "genre": ["pop", "edm"],
  "user": "<userId>",
  "likes": [],
  "comments": [],
  "createdAt": "<timestamp>",
  "url": "https://res.cloudinary.com/.../file.mp3",
  "public_id": "folder/file",
  "format": "mp3",
  "size": 123456
}
```

### Stream Music
- Method: `GET`
- Path: `/api/auth/musics/stream/:id`
- Auth required: Yes
- Description: Stream audio in chunks from the remote storage. This endpoint supports the `Range` header and proxies byte-range requests so players can request and buffer parts of the file instead of downloading the whole file.

Example:
```http
GET /api/auth/musics/stream/64f0e3f0d2a1b2c3d4e5f678
Range: bytes=0-
```

Notes:
- The endpoint forwards `Range` requests to the remote file (Cloudinary) and returns the appropriate `Content-Range`/`Content-Length`/`Content-Type` headers to allow HTML `<audio>` elements or other players to stream and seek within the file.
- Use the `url` returned from the upload response only for reference; playback should use the `/stream/:id` endpoint to avoid exposing direct download links.

### 3.2 Search Music
- Method: `GET`
- Path: `/api/auth/musics/search/:name`
- Auth required: Yes
- Description: Search music by title/info text.

Example:
```http
GET /api/auth/musics/search/chill
```

Success response:
```json
[
  {
    "_id": "<musicId>",
    "info": "Chill beats",
    "genre": ["pop"],
    "user": "<userId>",
    "likes": [],
    "comments": []
  }
]
```

### 3.3 Play Music
- Method: `GET`
- Path: `/api/auth/musics/play/:id`
- Auth required: Yes
- Description: Get basic music details by id.

Example:
```http
GET /api/auth/musics/play/64f0e3f0d2a1b2c3d4e5f678
```

Success response:
```json
{
  "userid": "johndoe",
  "info": "Chill beats",
  "genre": ["pop"],
  "likes": 3
}
```

### 3.4 Delete Music
- Method: `DELETE`
- Path: `/api/auth/musics/delete`
- Auth required: Yes
- Description: Delete a music entry owned by the authenticated user.

Request body:
```json
{
  "id": "<musicId>"
}
```

Success response:
```json
{
  "message": "Deleted"
}
```

### 3.5 Like Music
- Method: `PATCH`
- Path: `/api/auth/musics/like`
- Auth required: Yes
- Description: Like a music entry.

Request body:
```json
{
  "id": "<musicId>"
}
```

Success response:
```json
{
  "likes": 4
}
```

### 3.6 Unlike Music
- Method: `PATCH`
- Path: `/api/auth/musics/unlike`
- Auth required: Yes
- Description: Remove a like from a music entry.

Request body:
```json
{
  "id": "<musicId>"
}
```

Success response:
```json
{
  "likes": 3
}
```

---

## 4. Comments

### 4.1 Create Comment
- Method: `POST`
- Path: `/api/auth/comments/create`
- Auth required: Yes
- Description: Create a comment for a music item.

Request body:
```json
{
  "info": "Nice track!",
  "m_id": "<musicId>"
}
```

Success response:
```json
{
  "comment": {
    "_id": "<commentId>",
    "info": "Nice track!",
    "user": "<userId>",
    "m_id": "<musicId>",
    "likes": []
  },
  "user": {
    "userid": "johndoe",
    "name": "John Doe"
  },
  "music": {
    "id": "<musicId>"
  }
}
```

### 4.2 Get Comments
- Method: `GET`
- Path: `/api/auth/comments/get/:m_id/:pg`
- Auth required: Yes
- Description: Get paginated comments for a music item.

Example:
```http
GET /api/auth/comments/get/64f0e3f0d2a1b2c3d4e5f678/1
```

Success response:
```json
[
  {
    "_id": "<commentId>",
    "info": "Nice track!",
    "user": "<userId>",
    "m_id": "<musicId>",
    "likes": []
  }
]
```

### 4.3 Edit Comment
- Method: `PATCH`
- Path: `/api/auth/comments/edit`
- Auth required: Yes
- Description: Update your own comment.

Request body:
```json
{
  "id": "<commentId>",
  "info": "Updated comment"
}
```

Success response:
```json
{
  "message": "Updated!"
}
```

### 4.4 Delete Comment
- Method: `DELETE`
- Path: `/api/auth/comments/delete`
- Auth required: Yes
- Description: Delete your own comment.

Request body:
```json
{
  "cid": "<commentId>"
}
```

Success response:
```json
{
  "message": "Success!"
}
```

### 4.5 Like Comment
- Method: `PATCH`
- Path: `/api/auth/comments/like`
- Auth required: Yes
- Description: Like a comment.

Request body:
```json
{
  "cid": "<commentId>"
}
```

Success response:
```json
{
  "message": "Success!"
}
```

### 4.6 Unlike Comment
- Method: `PATCH`
- Path: `/api/auth/comments/unlike`
- Auth required: Yes
- Description: Remove a like from a comment.

Request body:
```json
{
  "cid": "<commentId>"
}
```

Success response:
```json
{
  "message": "Success!"
}
```

---

## 5. Follow System

### 5.1 Search User
- Method: `GET`
- Path: `/api/auth/follow/search/:uid`
- Auth required: Yes
- Description: Lookup a user by userid.

Example:
```http
GET /api/auth/follow/search/johndoe
```

Success response:
```json
{
  "name": "John Doe",
  "musics": ["<musicId1>"]
}
```

### 5.2 Follow User
- Method: `PATCH`
- Path: `/api/auth/follow/follow/:uid`
- Auth required: Yes
- Description: Follow a user by userid.

Example:
```http
PATCH /api/auth/follow/follow/johndoe
```

Success response:
```json
{
  "message": "Done!"
}
```

### 5.3 Unfollow User
- Method: `PATCH`
- Path: `/api/auth/follow/unfollow/:uid`
- Auth required: Yes
- Description: Unfollow a user by userid.

Example:
```http
PATCH /api/auth/follow/unfollow/johndoe
```

Success response:
```json
{
  "message": "Done!"
}
```

### 5.4 Get Followers
- Method: `GET`
- Path: `/api/auth/follow/followers/:uid`
- Auth required: Yes
- Description: Get a list of follower userids.

Example:
```http
GET /api/auth/follow/followers/johndoe
```

Success response:
```json
{
  "userList": ["alice", "bob"]
}
```

### 5.5 Get Following
- Method: `GET`
- Path: `/api/auth/follow/following/:uid`
- Auth required: Yes
- Description: Get a list of following userids.

Example:
```http
GET /api/auth/follow/following/johndoe
```

Success response:
```json
{
  "userList": ["alice", "bob"]
}
```

---

## 6. Feed

### 6.1 Get Feed
- Method: `GET`
- Path: `/api/auth/feed/:genre/:pg`
- Auth required: Yes
- Description: Get feed results by genre or the liked items list.

Examples:
```http
GET /api/auth/feed/all/1
GET /api/auth/feed/pop/1
GET /api/auth/feed/liked/1
```

Supported genres:
- `all`
- `pop`
- `rock`
- `edm`
- `classical`
- `blue`
- `jazz`
- `metal`
- `hiphop`
- `indie`
- `liked`

Success response for `all` or a genre:
```json
{
  "start": 1,
  "limit": 10,
  "total": 25,
  "pages": 3,
  "data": [
    {
      "_id": "<musicId>",
      "info": "Chill beats",
      "genre": ["pop"],
      "user": "<userId>",
      "likes": [],
      "comments": []
    }
  ]
}
```

Success response for `liked`:
```json
{
  "data": []
}
```

---

## 7. Common Error Responses

### Validation / auth errors
```json
{
  "message": "All fields are required"
}
```

### Not found
```json
{
  "message": "User not found"
}
```

### Unauthorized / forbidden
```json
{
  "message": "Token is required"
}
```

```json
{
  "message": "Invalid token"
}
```

```json
{
  "message": "Unauthorized"
}
```

### Server error
```json
{
  "message": "Internal server error"
}
```
