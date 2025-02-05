# Setup and Running Guide

## Table of Contents
1. [Initial Setup](#1-initial-setup)
2. [Running the Application](#2-running-the-application)
3. [Traffic Management Commands](#3-traffic-management-commands)
4. [Testing Commands](#4-testing-commands)
5. [Monitoring Commands](#5-monitoring-commands)
6. [Troubleshooting](#6-troubleshooting)

## 1. Initial Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher)

### Installation Steps

1. **Clone the Repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Install Global Dependencies**
```bash
# Install Artillery for load testing
npm install -g artillery

# Install nodemon for development
npm install -g nodemon
```

4. **Create Required Directories**
```bash
# Create upload directories
mkdir -p uploads/csv
mkdir -p uploads/revaluation
mkdir -p logs
```

5. **Environment Setup**
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/college_management
NODE_ENV=development
```

## 2. Running the Application

### Development Mode
```bash
# Run with nodemon for development
npm run dev
```

### Production Mode
```bash
# Run with cluster mode enabled
npm start
```

### Expected Output
```plaintext
[INFO] Master process 12345 is running
[INFO] Setting up 4 workers...
[INFO] Worker 12346 is online
[INFO] Worker 12347 is online
[INFO] Worker 12348 is online
[INFO] Worker 12349 is online
[INFO] Connected to MongoDB
[INFO] Server is running on port 3000
```

## 3. Traffic Management Commands

### Monitor Server Status
```bash
# Access the status dashboard
open http://localhost:3000/status
```

### View Real-time Logs
```bash
# Watch all logs
tail -f logs/combined.log

# Watch error logs only
tail -f logs/error.log
```

### Check Worker Processes
```bash
# List all Node.js processes
ps aux | grep node

# Monitor CPU usage
top -p $(pgrep -d',' node)
```

### Rate Limiting Test
```bash
# Test rate limiting (should get 429 after 100 requests/minute)
for i in {1..120}; do 
    curl -I http://localhost:3000/api/exams/results/CS21001
    sleep 0.5
done
```

## 4. Testing Commands

### Load Testing with Artillery

1. **Quick Load Test**
```bash
# Run a quick load test (20 virtual users, 50 requests each)
artillery quick --count 20 --num 50 http://localhost:3000/api/exams/results/CS21001
```

2. **Custom Scenario Test**
Create `load-test.yml`:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
scenarios:
  - flow:
      - get:
          url: "/api/exams/results/CS21001"
```

Run the test:
```bash
artillery run load-test.yml
```

### API Testing

1. **Test Student API**
```bash
# Get student details
curl http://localhost:3000/api/students/CS21001

# Update marks
curl -X PUT http://localhost:3000/api/students/CS21001/marks \
  -H "Content-Type: application/json" \
  -d '{"subjectCode": "CS101", "marks": 90}'

# Delete subject
curl -X DELETE http://localhost:3000/api/students/CS21001/subject \
  -H "Content-Type: application/json" \
  -d '{"subjectCode": "CS101"}'
```

2. **Test Exam Results API**
```bash
# Upload results CSV
curl -X POST http://localhost:3000/api/exams \
  -F "semester=Fall 2024" \
  -F "examDate=2024-02-04" \
  -F "examType=Regular" \
  -F "csvFile=@./sample_marks.csv"
```

## 5. Monitoring Commands

### System Monitoring
```bash
# Monitor system resources
htop

# Monitor network connections
netstat -an | grep 3000

# Monitor file system
df -h
```

### Application Monitoring
```bash
# Check application logs
grep "Rate Limit Exceeded" logs/combined.log

# Monitor response times
grep "Performance Metrics" logs/combined.log | jq .responseTime

# Check error rates
grep -c "ERROR" logs/error.log
```

### MongoDB Monitoring
```bash
# Connect to MongoDB shell
mongosh

# Check database status
db.serverStatus()

# Monitor connections
db.currentOp(true)
```

## 6. Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Issues**
```bash
# Check MongoDB status
sudo service mongodb status

# Restart MongoDB
sudo service mongodb restart
```

2. **Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

3. **Worker Process Issues**
```bash
# Restart the application
npm run dev

# Check worker process logs
grep "Worker" logs/combined.log
```

4. **Memory Issues**
```bash
# Check memory usage
free -m

# Monitor Node.js memory
node --expose-gc --trace-gc server.js
```

### Performance Optimization

1. **Increase Node.js Memory**
```bash
# Run with increased memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

2. **Optimize MongoDB**
```bash
# Create indexes
mongosh college_management --eval '
db.examDetails.createIndex({"studentResults.usn": 1});
db.examDetails.createIndex({"semester": 1});
'
```

### Logging Levels
You can adjust logging levels in `utils/logger.js`:
```javascript
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    // ... rest of the configuration
});
```

Available log levels:
- error: 0
- warn: 1
- info: 2
- debug: 3

## Additional Resources

1. **Documentation**
- [API Documentation](./API_DOCUMENTATION.md)
- [Traffic Management Documentation](./TRAFFIC_MANAGEMENT.md)

2. **Sample Data**
- [Sample Marks CSV](./sample_marks.csv)
- [Load Test Scenarios](./load-test.yml)

3. **Monitoring**
- Status Dashboard: http://localhost:3000/status
- Log Files: ./logs/
- Performance Metrics: ./logs/combined.log
