# API Reference (v1)

All endpoints are prefixed with `/api/v1`. All protected endpoints require an `Authorization: Bearer <JWT>` header.

## Auth
### `POST /auth/login`
- **Role**: PUBLIC
- **Request**: FormData (`username`, `password`)
- **Response 200**: `{ "access_token": "...", "token_type": "bearer", "user_id": 1, "employee_id": "A001", "full_name": "...", "role": "ADMIN" }`
- **Error 401**: Incorrect username or password.

## Operator
### `POST /operator/inspection`
- **Role**: OPERATOR
- **Request JSON**: `{ "qr_text": "PART;SERIAL;VENDOR" }`
- **Response 200**: Creates or resumes inspection. Returns inspection object.
- **Error 400**: Invalid QR format.

### `PUT /operator/response`
- **Role**: OPERATOR
- **Request JSON**: `{ "inspection_id": 1, "checklist_id": 1, "result": "OK", "description": "", "photo_id": null }`
- **Response 200**: Saves the response.
- **Error 400**: Missing required data.

### `POST /operator/photos`
- **Role**: OPERATOR
- **Request**: Multipart/Form-Data (`inspection_id`, `checklist_id`, `file`)
- **Response 200**: `{ "photo_id": 1 }`
- **Error 413**: File exceeds 10MB.
- **Error 400**: File is not JPG/PNG.

### `POST /operator/inspection/{id}/submit`
- **Role**: OPERATOR
- **Request**: None
- **Response 200**: Submits the inspection.
- **Error 400**: Missing mandatory photos or descriptions for NOT OK results.

## Manager
### `GET /manager/dashboard`
- **Role**: MANAGER
- **Response 200**: Returns counts for total, in-progress, and submitted inspections.

*(Note: Managers also have access to Operator endpoints disguised under `/manager/inspection/...` for Operator Mode).*

## Admin
### `POST /admin/users`
- **Role**: ADMIN
- **Request JSON**: `{ "employee_id": "...", "full_name": "...", "password": "...", "role": "...", "is_active": 1 }`
- **Response 200**: Returns created user.
- **Error 400**: Employee ID exists.
