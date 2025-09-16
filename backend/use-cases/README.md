# API Use Cases Documentation

This directory contains comprehensive use case definitions for all API endpoints, generated from the actual implementation and schemas.

## Use Case Structure

Each use case file follows the standardized format:

```json
{
  "type": "object",
  "required": ["partitions", "boundaries", "scenarios", "negatives", "oracle_rules", "assumptions"],
  "properties": {
    "partitions": { "type": "array", "items": { "type": "string" }},
    "boundaries": { "type": "array", "items": { "type": "string" }},
    "scenarios": { "type": "array", "items": { "type": "string" }},
    "negatives": { "type": "array", "items": { "type": "string" }},
    "oracle_rules": { "type": "array", "items": { "type": "string" }},
    "assumptions": { "type": "array", "items": { "type": "string" }}
  }
}
```

## Use Case Components

### **Partitions**
Input data categories that define different test scenarios:
- Valid data variations
- Invalid data variations
- Edge cases and boundary conditions
- Different data combinations

### **Boundaries**
Validation rules and constraints:
- Field length limits
- Format requirements
- Type constraints
- Business rules

### **Scenarios**
Valid use case scenarios:
- Happy path scenarios
- Different data combinations
- Various user workflows
- Expected user behaviors

### **Negatives**
Invalid input and error conditions:
- Missing required fields
- Invalid formats
- Boundary violations
- Malformed data

### **Oracle Rules**
Expected behavior and validation rules:
- Success response formats
- Error response formats
- Status codes
- Data validation rules

### **Assumptions**
System and environment assumptions:
- Database state
- System configuration
- Network conditions
- Resource availability

## Use Case Files

### **Candidate Management**
- **`post-candidates-usecases.json`** - POST /candidates
  - 12 partitions covering valid/invalid candidate data
  - 16 boundaries including validation rules
  - 12 scenarios for different candidate profiles
  - 30 negatives covering all error conditions
  - 15 oracle rules for response validation
  - 15 assumptions about system state

- **`get-candidates-id-usecases.json`** - GET /candidates/{id}
  - 12 partitions covering different ID scenarios
  - 12 boundaries for ID validation and response structure
  - 12 scenarios for different candidate data states
  - 18 negatives covering invalid ID formats
  - 15 oracle rules for response validation
  - 15 assumptions about database state

- **`put-candidates-id-usecases.json`** - PUT /candidates/{id}
  - 12 partitions covering application and interview step scenarios
  - 12 boundaries for request validation
  - 12 scenarios for different stage updates
  - 24 negatives covering all invalid inputs
  - 15 oracle rules for update validation
  - 15 assumptions about application state

### **Position Management**
- **`get-positions-usecases.json`** - GET /positions
  - 12 partitions covering different database states
  - 12 boundaries for query and response validation
  - 12 scenarios for different position data
  - 15 negatives covering database errors
  - 15 oracle rules for response validation
  - 15 assumptions about database state

- **`get-positions-id-candidates-usecases.json`** - GET /positions/{id}/candidates
  - 12 partitions covering different candidate scenarios
  - 12 boundaries for ID validation and score calculation
  - 12 scenarios for different interview progress
  - 18 negatives covering invalid ID formats
  - 15 oracle rules for response validation
  - 15 assumptions about database relationships

- **`get-positions-id-interviewflow-usecases.json`** - GET /positions/{id}/interviewflow
  - 12 partitions covering different interview flow scenarios
  - 11 boundaries for ID validation and nested response structure
  - 12 scenarios for different interview flow configurations
  - 18 negatives covering invalid ID formats
  - 15 oracle rules for nested response validation
  - 15 assumptions about database relationships

### **File Management**
- **`post-upload-usecases.json`** - POST /upload
  - 12 partitions covering different file types and sizes
  - 12 boundaries for file validation and storage
  - 12 scenarios for different file uploads
  - 25 negatives covering all invalid file conditions
  - 15 oracle rules for file upload validation
  - 15 assumptions about file system state

## Usage for Testing

### **Test Case Generation**
Use these use cases to generate comprehensive test suites:

```typescript
// Example: Generate test cases from use cases
import postCandidatesUseCases from './post-candidates-usecases.json';

const testCases = postCandidatesUseCases.partitions.map(partition => ({
  name: `POST /candidates - ${partition}`,
  input: generateInputForPartition(partition),
  expected: getExpectedResultForPartition(partition)
}));
```

### **Validation Testing**
Use oracle rules to validate API responses:

```typescript
// Example: Validate response against oracle rules
const validateResponse = (response, oracleRules) => {
  return oracleRules.every(rule => {
    // Implement rule validation logic
    return validateRule(response, rule);
  });
};
```

### **Boundary Testing**
Use boundaries to test edge cases:

```typescript
// Example: Test boundary conditions
const boundaryTests = [
  { field: 'firstName', value: 'A', expected: 'minLength error' },
  { field: 'firstName', value: 'A'.repeat(51), expected: 'maxLength error' },
  { field: 'email', value: 'invalid-email', expected: 'format error' }
];
```

## Integration with Testing Frameworks

### **Jest Integration**
```typescript
describe('POST /candidates', () => {
  const useCases = require('./post-candidates-usecases.json');
  
  useCases.scenarios.forEach(scenario => {
    test(scenario, async () => {
      // Test implementation
    });
  });
});
```

### **Cypress Integration**
```typescript
// Use scenarios for E2E testing
const scenarios = require('./post-candidates-usecases.json').scenarios;

scenarios.forEach(scenario => {
  it(`should handle: ${scenario}`, () => {
    // Cypress test implementation
  });
});
```

## Quality Assurance

These use cases provide:
- **Complete Coverage**: All input variations and edge cases
- **Validation Rules**: Comprehensive boundary testing
- **Error Handling**: All possible error conditions
- **Response Validation**: Expected behavior verification
- **System Assumptions**: Environment and state requirements

Use these use cases to ensure robust API testing and validation.
