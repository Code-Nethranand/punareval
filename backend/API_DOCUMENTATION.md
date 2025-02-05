# API Documentation

Base URL: `http://localhost:3000/api`

## Table of Contents
1. [Announcements API](#announcements-api)
2. [Exam Details API](#exam-details-api)
3. [Revaluation API](#revaluation-api)
4. [Student Management API](#student-management-api)
5. [Test Data for Postman](#test-data-for-postman)
6. [Traffic Management Features](#traffic-management-features)

## Announcements API

### Get All Announcements
```http
GET /announcements
```
Response:
```json
[
    {
        "_id": "string",
        "title": "string",
        "date": "date",
        "type": "string (Announcement|Result|Revaluation|Notice)",
        "link": "string (optional)",
        "createdAt": "date",
        "updatedAt": "date"
    }
]
```

### Create Announcement
```http
POST /announcements
Content-Type: application/json

{
    "title": "string",
    "date": "date",
    "type": "string (Announcement|Result|Revaluation|Notice)",
    "link": "string (optional)"
}
```
Response:
```json
{
    "_id": "string",
    "title": "string",
    "date": "date",
    "type": "string",
    "link": "string",
    "createdAt": "date",
    "updatedAt": "date"
}
```

### Get Single Announcement
```http
GET /announcements/:id
```
Response:
```json
{
    "_id": "string",
    "title": "string",
    "date": "date",
    "type": "string",
    "link": "string",
    "createdAt": "date",
    "updatedAt": "date"
}
```

### Update Announcement
```http
PUT /announcements/:id
Content-Type: application/json

{
    "title": "string",
    "date": "date",
    "type": "string",
    "link": "string"
}
```
Response: Same as Get Single Announcement

### Delete Announcement
```http
DELETE /announcements/:id
```
Response:
```json
{
    "message": "Announcement deleted successfully"
}
```

## Exam Details API

### Get All Exam Details
```http
GET /api/exams
```
Response:
```json
[
    {
        "_id": "string",
        "semester": "string",
        "examDate": "date",
        "examType": "string (Required: 'Regular' or 'Supplementary')",
        "studentResults": [
            {
                "studentName": "string",
                "usn": "string",
                "subjects": [
                    {
                        "subjectCode": "string",
                        "subjectName": "string",
                        "marks": "number",
                        "credits": "number"
                    }
                ],
                "totalMarks": "number",
                "percentage": "number",
                "result": "string (Pass|Fail)"
            }
        ],
        "createdAt": "date",
        "updatedAt": "date"
    }
]
```

### Create Exam Details
```http
POST /api/exams
Content-Type: multipart/form-data

Required Fields:
- semester: string (e.g., "Fall 2024")
- examDate: date (format: YYYY-MM-DD)
- examType: string (must be either "Regular" or "Supplementary")
- csvFile: file upload
```

Example Request in Postman:
1. Select "POST" method
2. Enter URL: `http://localhost:3000/api/exams`
3. In the "Body" tab:
   - Select "form-data"
   - Add the following key-value pairs:
     ```plaintext
     semester: Fall 2024
     examDate: 2024-02-04
     examType: Regular
     csvFile: [Select your CSV file]
     ```

CSV File Requirements:
- Format: CSV
- Required columns (exact names required):
  - studentName
  - usn
  - subjectCode
  - subjectName
  - marks
  - credits

Example CSV content (`sample_marks.csv`):
```csv
studentName,usn,subjectCode,subjectName,marks,credits
John Doe,CS21001,CS101,Computer Science,85,4
John Doe,CS21001,CS102,Data Structures,78,4
Jane Smith,CS21002,CS101,Computer Science,90,4
Jane Smith,CS21002,CS102,Data Structures,88,4
```

Example Success Response:
```json
{
    "_id": "65bf7a8d9a5c4b2e3c1d9f8e",
    "semester": "Fall 2024",
    "examDate": "2024-02-04T00:00:00.000Z",
    "examType": "Regular",
    "studentResults": [
        {
            "studentName": "John Doe",
            "usn": "CS21001",
            "subjects": [
                {
                    "subjectCode": "CS101",
                    "subjectName": "Computer Science",
                    "marks": 85,
                    "credits": 4
                },
                {
                    "subjectCode": "CS102",
                    "subjectName": "Data Structures",
                    "marks": 78,
                    "credits": 4
                }
            ],
            "totalMarks": 163,
            "percentage": 81.5,
            "result": "Pass"
        }
    ],
    "createdAt": "2024-02-04T12:30:45.123Z",
    "updatedAt": "2024-02-04T12:30:45.123Z"
}
```

Example Error Response:
```json
{
    "message": "ExamDetails validation failed: examType: Path `examType` is required."
}
```

### Get Single Exam Detail
```http
GET /api/exams/:id
```
Response: Same as single object in Get All Exam Details

### Get Results by USN
```http
GET /api/exams/results/:usn
```
Example:
```http
GET /api/exams/results/CS21001
```

Response:
```json
[
    {
        "semester": "Fall 2024",
        "examDate": "2024-02-04T00:00:00.000Z",
        "examType": "Regular",
        "result": {
            "studentName": "John Doe",
            "usn": "CS21001",
            "subjects": [
                {
                    "subjectCode": "CS101",
                    "subjectName": "Computer Science",
                    "marks": 85,
                    "credits": 4
                },
                {
                    "subjectCode": "CS102",
                    "subjectName": "Data Structures",
                    "marks": 78,
                    "credits": 4
                }
            ],
            "totalMarks": 163,
            "percentage": 81.5,
            "result": "Pass"
        }
    }
]
```

### Update Exam Details
```http
PUT /api/exams/:id
Content-Type: multipart/form-data

Required Fields:
- semester: string
- examDate: date (YYYY-MM-DD)
- examType: string ("Regular" or "Supplementary")
Optional Field:
- csvFile: file upload (new CSV file if marks need to be updated)
```

Example Request:
```plaintext
semester: Fall 2024
examDate: 2024-02-04
examType: Regular
csvFile: [Upload updated CSV if needed]
```

Response: Same as Create Exam Details response format

### Delete Exam Details
```http
DELETE /api/exams/:id
```
Success Response:
```json
{
    "message": "Exam details deleted successfully"
}
```

## Revaluation API

### Get All Revaluation Applications
```http
GET /revaluation
```
Response:
```json
[
    {
        "_id": "string",
        "name": "string",
        "usn": "string",
        "subjectCode": "string",
        "subjectName": "string",
        "semester": "string",
        "marks": "number",
        "credits": "number",
        "fees": "number",
        "paymentStatus": "string (Paid|Pending)",
        "evaluationStatus": "string (Pending|Evaluated)",
        "pdfPath": "string (optional)",
        "evaluatedMarks": "number (optional)",
        "createdAt": "date",
        "updatedAt": "date"
    }
]
```

### Create Revaluation Application
```http
POST /revaluation
Content-Type: application/json

{
    "name": "string",
    "usn": "string",
    "subjectCode": "string",
    "subjectName": "string",
    "semester": "string",
    "marks": "number",
    "credits": "number",
    "fees": "number"
}
```
Response:
```json
{
    "_id": "string",
    "name": "string",
    "usn": "string",
    "subjectCode": "string",
    "subjectName": "string",
    "semester": "string",
    "marks": "number",
    "credits": "number",
    "fees": "number",
    "paymentStatus": "Pending",
    "evaluationStatus": "Pending",
    "createdAt": "date",
    "updatedAt": "date"
}
```

### Get Single Revaluation Application
```http
GET /revaluation/:id
```
Response: Same as single object in Get All Revaluation Applications

### Update Payment Status
```http
PATCH /revaluation/:id/payment
Content-Type: application/json

{
    "paymentStatus": "string (Paid|Pending)"
}
```
Response: Same as single object in Get All Revaluation Applications

### Evaluate Application
```http
POST /revaluation/:id/evaluate
Content-Type: multipart/form-data

marks: "number"
pdfFile: [file]
```
Response:
```json
{
    "_id": "string",
    "name": "string",
    "usn": "string",
    "subjectCode": "string",
    "subjectName": "string",
    "semester": "string",
    "marks": "number",
    "evaluatedMarks": "number",
    "credits": "number",
    "fees": "number",
    "paymentStatus": "string",
    "evaluationStatus": "Evaluated",
    "pdfPath": "string",
    "createdAt": "date",
    "updatedAt": "date"
}
```

### Delete Revaluation Application
```http
DELETE /revaluation/:id
```
Response:
```json
{
    "message": "Application deleted successfully"
}
```

## Student Management API

### Get Student Details
```http
GET /api/students/:usn
```

Example:
```http
GET /api/students/CS21001
```

Response:
```json
{
    "studentName": "John Doe",
    "usn": "CS21001",
    "subjects": [
        {
            "subjectCode": "CS101",
            "subjectName": "Computer Science",
            "marks": 85,
            "credits": 4
        },
        {
            "subjectCode": "CS102",
            "subjectName": "Data Structures",
            "marks": 78,
            "credits": 4
        }
    ],
    "totalMarks": 163,
    "percentage": 81.5,
    "result": "Pass"
}
```

### Update Student Marks
```http
PUT /api/students/:usn/marks
Content-Type: application/json

{
    "subjectCode": "CS101",
    "marks": 90
}
```

Example Response:
```json
{
    "message": "Marks updated successfully",
    "student": {
        "studentName": "John Doe",
        "usn": "CS21001",
        "subjects": [
            {
                "subjectCode": "CS101",
                "subjectName": "Computer Science",
                "marks": 90,
                "credits": 4
            },
            {
                "subjectCode": "CS102",
                "subjectName": "Data Structures",
                "marks": 78,
                "credits": 4
            }
        ],
        "totalMarks": 168,
        "percentage": 84.0,
        "result": "Pass"
    }
}
```

### Delete Student Subject
```http
DELETE /api/students/:usn/subject
Content-Type: application/json

{
    "subjectCode": "CS101"
}
```

Example Response:
```json
{
    "message": "Subject deleted successfully",
    "student": {
        "studentName": "John Doe",
        "usn": "CS21001",
        "subjects": [
            {
                "subjectCode": "CS102",
                "subjectName": "Data Structures",
                "marks": 78,
                "credits": 4
            }
        ],
        "totalMarks": 78,
        "percentage": 78.0,
        "result": "Pass"
    }
}
```

### Error Responses

1. Student Not Found:
```json
{
    "message": "Student not found"
}
```

2. Subject Not Found:
```json
{
    "message": "Subject not found"
}
```

3. Invalid Input:
```json
{
    "message": "Subject code and marks are required"
}
```

### Testing in Postman

1. Get Student Details:
   ```plaintext
   GET http://localhost:3000/api/students/CS21001
   ```

2. Update Student Marks:
   ```plaintext
   PUT http://localhost:3000/api/students/CS21001/marks
   Body (raw JSON):
   {
       "subjectCode": "CS101",
       "marks": 90
   }
   ```

3. Delete Student Subject:
   ```plaintext
   DELETE http://localhost:3000/api/students/CS21001/subject
   Body (raw JSON):
   {
       "subjectCode": "CS101"
   }
   ```

### Security Notes
- All endpoints require admin authentication
- Actions are logged for audit purposes
- Rate limiting applies to these endpoints

## Test Data for Postman

### Announcements API Test Data

1. Create Announcement (Regular)
```json
{
    "title": "Mid-term Examination Schedule",
    "date": "2024-03-15",
    "type": "Announcement",
    "link": "https://example.com/midterm-schedule"
}
```

2. Create Announcement (Result)
```json
{
    "title": "Semester 5 Results Declared",
    "date": "2024-02-04",
    "type": "Result",
    "link": "https://example.com/sem5-results"
}
```

3. Create Announcement (Notice)
```json
{
    "title": "Holiday Notice - College Foundation Day",
    "date": "2024-02-10",
    "type": "Notice",
    "link": "https://example.com/holiday-notice"
}
```

### Exam Details API Test Data

1. Sample CSV Content (save as `test_marks.csv`):
```csv
studentName,usn,subjectCode,subjectName,marks,credits
John Doe,CS21001,CS101,Computer Science,85,4
John Doe,CS21001,CS102,Data Structures,78,4
John Doe,CS21001,CS103,Database Management,92,3
Jane Smith,CS21002,CS101,Computer Science,90,4
Jane Smith,CS21002,CS102,Data Structures,88,4
Jane Smith,CS21002,CS103,Database Management,95,3
Mike Johnson,CS21003,CS101,Computer Science,75,4
Mike Johnson,CS21003,CS102,Data Structures,82,4
Mike Johnson,CS21003,CS103,Database Management,88,3
```

2. Create Exam Details (Form Data):
```plaintext
semester: Fall 2024
examDate: 2024-02-04
examType: Regular
csvFile: [Upload test_marks.csv]
```

3. Update Exam Details (Form Data):
```plaintext
semester: Fall 2024 Updated
examDate: 2024-02-05
examType: Regular
csvFile: [Upload updated CSV if needed]
```

### Revaluation API Test Data

1. Create Revaluation Application
```json
{
    "name": "John Doe",
    "usn": "CS21001",
    "subjectCode": "CS101",
    "subjectName": "Computer Science",
    "semester": "5",
    "marks": 40,
    "credits": 4,
    "fees": 500
}
```

2. Multiple Test Cases
```json
[
    {
        "name": "Jane Smith",
        "usn": "CS21002",
        "subjectCode": "CS102",
        "subjectName": "Data Structures",
        "semester": "5",
        "marks": 35,
        "credits": 4,
        "fees": 500
    },
    {
        "name": "Mike Johnson",
        "usn": "CS21003",
        "subjectCode": "CS103",
        "subjectName": "Database Management",
        "semester": "5",
        "marks": 42,
        "credits": 3,
        "fees": 500
    },
    {
        "name": "Sarah Williams",
        "usn": "CS21004",
        "subjectCode": "CS104",
        "subjectName": "Operating Systems",
        "semester": "5",
        "marks": 38,
        "credits": 4,
        "fees": 500
    }
]
```

3. Update Payment Status
```json
{
    "paymentStatus": "Paid"
}
```

4. Evaluate Application (Form Data):
```plaintext
marks: 45
pdfFile: [Upload evaluation.pdf]
```

### Sample PDF for Testing
You can create a dummy PDF file with this content:
```plaintext
Revaluation Report
Student Name: John Doe
USN: CS21001
Subject: Computer Science (CS101)
Original Marks: 40
Revised Marks: 45
Evaluator Comments: After careful review, 5 marks added in question 3 and 4.
```

### Testing Sequence

1. **Announcements Testing Sequence:**
   1. Create an announcement of each type
   2. Get all announcements to verify creation
   3. Update one announcement
   4. Delete one announcement

2. **Exam Details Testing Sequence:**
   1. Create exam details with test CSV
   2. Get all exam details
   3. Get single exam detail
   4. Update exam details
   5. Delete exam details

3. **Revaluation Testing Sequence:**
   1. Create multiple revaluation applications
   2. Get all applications
   3. Update payment status to "Paid"
   4. Upload evaluation PDF
   5. Check updated status
   6. Delete application

### Postman Collection Setup

1. Create a new collection named "College Management System"
2. Set up environment variables:
   ```
   BASE_URL: http://localhost:3000/api
   ```

3. Folder Structure:
   ```
   College Management System
   ├── Announcements
   │   ├── Get All
   │   ├── Create
   │   ├── Get Single
   │   ├── Update
   │   └── Delete
   ├── Exam Details
   │   ├── Get All
   │   ├── Create
   │   ├── Get Single
   │   ├── Update
   │   └── Delete
   └── Revaluation
       ├── Get All
       ├── Create
       ├── Get Single
       ├── Update Payment
       ├── Evaluate
       └── Delete
   ```

4. For each request:
   - URL: {{BASE_URL}}/[endpoint]
   - Set appropriate Content-Type header
   - Add test data from above sections

### Error Testing Data

1. Invalid Announcement Type:
```json
{
    "title": "Test Announcement",
    "date": "2024-02-04",
    "type": "Invalid",
    "link": "https://example.com"
}
```

2. Missing Required Fields:
```json
{
    "title": "Test Announcement",
    "type": "Notice"
}
```

3. Invalid Date Format:
```json
{
    "title": "Test Announcement",
    "date": "invalid-date",
    "type": "Notice"
}
```

4. Invalid Marks Value:
```json
{
    "name": "John Doe",
    "usn": "CS21001",
    "subjectCode": "CS101",
    "subjectName": "Computer Science",
    "semester": "5",
    "marks": -1,
    "credits": 4,
    "fees": 500
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "message": "Error message describing the validation or request issue"
}
```

### 404 Not Found
```json
{
    "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "message": "Internal server error message"
}
```

## File Upload Specifications

### CSV File (Exam Details)
- Format: CSV
- Required Columns:
  - studentName
  - usn
  - subjectCode
  - subjectName
  - marks
  - credits

Example CSV content:
```csv
studentName,usn,subjectCode,subjectName,marks,credits
John Doe,CS21001,CS101,Computer Science,85,4
Jane Smith,CS21002,CS101,Computer Science,90,4
```

### PDF File (Revaluation)
- Format: PDF only
- Maximum file size: 10MB
- Files are stored in: `uploads/revaluation/`

### Load Testing Commands
```bash
# Install artillery for load testing
npm install -g artillery

# Create a load test scenario
artillery quick --count 20 --num 50 http://localhost:3000/api/exams/results/CS21001

# Check the logs and /status endpoint for metrics

```

## Traffic Management Features

### Load Balancing
The application uses Node.js cluster module to distribute traffic across multiple CPU cores:
- Automatically creates worker processes based on available CPU cores
- Provides automatic load balancing of requests
- Implements worker process monitoring and automatic restart on failure

### Rate Limiting
To prevent abuse and ensure fair usage:
- 100 requests per minute per IP address
- After limit is reached, requests will receive a 429 (Too Many Requests) response
- Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

### Speed Limiting
Implements progressive delay for heavy users:
- First 50 requests per minute are processed at full speed
- Subsequent requests have increasing delays:
  - Request 51: 100ms delay
  - Request 52: 200ms delay
  - And so on...

### Performance Monitoring
Real-time monitoring available at `http://localhost:3000/status` endpoint (admin access required):
- CPU usage
- Memory usage
- Response times
- Request rates
- Status codes
- Process information

### Logging
Comprehensive logging system with different log levels:
- Performance metrics
- Rate limiting events
- Error tracking
- Worker process status
- All logs are stored in the `/logs` directory:
  - `error.log`: Error-level logs
  - `combined.log`: All logs with detailed information

### Example Log Formats

1. Performance Log:
```json
{
  "timestamp": "2024-02-04T18:00:00.000Z",
  "level": "info",
  "method": "GET",
  "url": "/api/exams/results/CS21001",
  "statusCode": 200,
  "responseTime": "45.23ms",
  "userAgent": "Mozilla/5.0..."
}
```

2. Rate Limit Log:
```json
{
  "timestamp": "2024-02-04T18:01:00.000Z",
  "level": "warn",
  "message": "Rate Limit Exceeded",
  "ip": "192.168.1.1",
  "url": "/api/exams/results/CS21001"
}
```

### Best Practices for High-Traffic Periods

1. **Implement Client-Side Caching:**
   ```javascript
   // Add to your frontend API calls
   const fetchResults = async (usn) => {
     const cachedData = localStorage.getItem(`results_${usn}`);
     if (cachedData) {
       const { data, timestamp } = JSON.parse(cachedData);
       // Cache for 5 minutes
       if (Date.now() - timestamp < 300000) {
         return data;
       }
     }
     const response = await fetch(`http://localhost:3000/api/exams/results/${usn}`);
     const data = await response.json();
     localStorage.setItem(`results_${usn}`, JSON.stringify({
       data,
       timestamp: Date.now()
     }));
     return data;
   };
   ```

2. **Implement Exponential Backoff:**
   ```javascript
   // Add to your frontend API calls
   const fetchWithRetry = async (url, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const response = await fetch(url);
         if (response.status === 429) {
           const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
           await new Promise(resolve => setTimeout(resolve, waitTime));
           continue;
         }
         return await response.json();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
       }
     }
   };
   ```
