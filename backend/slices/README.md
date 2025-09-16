# API Endpoint Slices

This folder contains individual YAML slices for each API endpoint, generated based on the actual implementation in the codebase.

## Generated Slices

### Candidate Endpoints
- **`post-candidates.yaml`** - POST /candidates
  - Creates a new candidate with education, work experience, and CV
  - Returns success message with candidate data
  - Handles email uniqueness validation

- **`get-candidates-id.yaml`** - GET /candidates/{id}
  - Retrieves detailed candidate information by ID
  - Includes education, work experience, and CV data
  - Validates ID format

- **`put-candidates-id.yaml`** - PUT /candidates/{id}
  - Updates candidate's interview stage
  - Requires applicationId and currentInterviewStep
  - Returns updated application data

### Position Endpoints
- **`get-positions.yaml`** - GET /positions
  - Retrieves all visible positions
  - Includes complete position details (salary, benefits, requirements, etc.)

- **`get-positions-id-candidates.yaml`** - GET /positions/{id}/candidates
  - Gets candidates for a specific position
  - Includes fullName, currentInterviewStep, candidateId, applicationId, and averageScore

- **`get-positions-id-interviewflow.yaml`** - GET /positions/{id}/interviewflow
  - Retrieves interview flow for a position
  - Returns nested structure with positionName and interviewFlow details

### File Upload Endpoint
- **`post-upload.yaml`** - POST /upload
  - Uploads PDF or DOCX files
  - Maximum file size: 10MB
  - Returns file path and MIME type

## Key Differences from Original API Spec

1. **Response Structures**: Updated to match actual implementation
2. **Error Handling**: Reflects actual error messages and status codes
3. **Additional Fields**: Includes fields returned by implementation but not in original spec
4. **Nested Responses**: Correctly represents nested response structures

## Usage

These slices can be used to:
- Generate accurate API documentation
- Create OpenAPI specifications
- Validate API responses
- Generate client SDKs
- Set up API testing

Each slice is self-contained and can be merged into a complete OpenAPI specification.
