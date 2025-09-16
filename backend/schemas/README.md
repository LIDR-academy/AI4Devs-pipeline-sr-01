# JSON Schema Validation Files

This directory contains JSON schemas for validating API requests and responses based on the actual implementation in the codebase.

## Schema Files

### Request Schemas
- **`post-candidates-request.json`** - Validates POST /candidates request body
- **`put-candidates-id-request.json`** - Validates PUT /candidates/{id} request body

### Response Schemas
- **`post-candidates-response.json`** - Validates POST /candidates success response
- **`get-candidates-id-response.json`** - Validates GET /candidates/{id} response
- **`put-candidates-id-response.json`** - Validates PUT /candidates/{id} success response
- **`get-positions-response.json`** - Validates GET /positions response
- **`get-positions-id-candidates-response.json`** - Validates GET /positions/{id}/candidates response
- **`get-positions-id-interviewflow-response.json`** - Validates GET /positions/{id}/interviewflow response
- **`post-upload-response.json`** - Validates POST /upload success response

### Error Schemas
- **`error-responses.json`** - Contains all error response schemas

### Index
- **`index.json`** - Central registry of all schemas and endpoint mappings

## Usage with AJV

### Installation
```bash
npm install ajv ajv-formats
```

### Basic Usage
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import postCandidatesRequestSchema from './schemas/post-candidates-request.json';

const ajv = new Ajv();
addFormats(ajv);

const validate = ajv.compile(postCandidatesRequestSchema);

// Validate request data
const isValid = validate(requestData);
if (!isValid) {
  console.log(validate.errors);
}
```

### TypeScript Integration
```typescript
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';

interface CandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: Education[];
  workExperiences?: WorkExperience[];
  cv?: CV;
}

const ajv = new Ajv();
addFormats(ajv);

const validate = ajv.compile<CandidateRequest>(postCandidatesRequestSchema);
```

## Schema Features

### Validation Rules
- **Required Fields**: Specified in `required` arrays
- **String Patterns**: Email, phone, date formats validated with regex
- **Length Constraints**: Min/max length for strings
- **Type Validation**: Strict type checking for all fields
- **Additional Properties**: Disabled to prevent unexpected fields

### Key Validation Patterns
- **Email**: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Phone**: `^\+?\d{1,3}?[- .]?\(?(?:\d{2,3})\)?[- .]?\d\d\d[- .]?\d\d\d\d$`
- **Names**: `^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$` (supports Spanish characters)
- **Dates**: `^\d{4}-\d{2}-\d{2}$` (YYYY-MM-DD format)

## Error Handling

All schemas include comprehensive error response validation:
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors

## Integration with Express

```typescript
import { Request, Response, NextFunction } from 'express';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

export const validateRequest = (schema: any) => {
  const validate = ajv.compile(schema);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const isValid = validate(req.body);
    if (!isValid) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validate.errors
      });
    }
    next();
  };
};

// Usage in routes
app.post('/candidates', 
  validateRequest(postCandidatesRequestSchema),
  addCandidateController
);
```

## Testing

These schemas can be used for:
- **Unit Testing**: Validate mock data
- **Integration Testing**: Validate API responses
- **Contract Testing**: Ensure API compliance
- **Documentation**: Generate API docs from schemas
