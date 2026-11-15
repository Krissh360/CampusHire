/**
 * CampusHire - Automated Backend API Integration Tests
 */
const http = require('http');
const app = require('../src/server');

const TEST_PORT = 5055;
let server;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting CampusHire Backend Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  server = app.listen(TEST_PORT);

  const testCase = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    await testCase('GET /api/health should return 200 and system status', async () => {
      const res = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/health',
        method: 'GET'
      });
      if (res.status !== 200 || !res.data.success) {
        throw new Error(`Expected status 200, got ${res.status}`);
      }
    });

    // 2. Student Login
    let studentToken = null;
    await testCase('POST /api/auth/login should authenticate student and return JWT', async () => {
      const res = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'aarav.sharma@college.edu',
        password: 'password123'
      });

      if (res.status !== 200 || !res.data.token) {
        throw new Error(`Login failed with status ${res.status}: ${JSON.stringify(res.data)}`);
      }
      studentToken = res.data.token;
      if (res.data.user.role !== 'student') throw new Error(`Expected role 'student', got ${res.data.user.role}`);
    });

    // 3. Student Profile
    await testCase('GET /api/students/profile with Bearer token returns academic record', async () => {
      const res = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/students/profile',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });

      if (res.status !== 200 || !res.data.student) {
        throw new Error(`Profile fetch failed with status ${res.status}`);
      }
      if (res.data.student.roll_number !== '2023CS0101') {
        throw new Error(`Expected roll 2023CS0101, got ${res.data.student.roll_number}`);
      }
    });

    // 4. Jobs Catalog & Eligibility
    await testCase('GET /api/jobs computes personalized eligibility for student', async () => {
      const res = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/jobs',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });

      if (res.status !== 200 || !Array.isArray(res.data.jobs)) {
        throw new Error(`Jobs fetch failed with status ${res.status}`);
      }
      const firstJob = res.data.jobs[0];
      if (!firstJob.eligibility_check) {
        throw new Error('Eligibility check object missing from response');
      }
      if (!firstJob.eligibility_check.is_eligible) {
        throw new Error(`Expected student Aarav (CGPA 9.4) to be eligible for Google, got false`);
      }
    });

    // 5. Company Login
    let companyToken = null;
    await testCase('POST /api/auth/login should authenticate company recruiter', async () => {
      const res = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'recruiter@google.com',
        password: 'password123'
      });

      if (res.status !== 200 || !res.data.token) {
        throw new Error(`Recruiter login failed: ${JSON.stringify(res.data)}`);
      }
      companyToken = res.data.token;
      if (res.data.user.role !== 'company') throw new Error(`Expected role 'company'`);
    });

    // 6. Admin Login
    let adminToken = null;
    await testCase('POST /api/auth/login should authenticate placement admin', async () => {
      const res = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'admin@campushire.edu',
        password: 'password123'
      });

      if (res.status !== 200 || !res.data.token) {
        throw new Error(`Admin login failed: ${JSON.stringify(res.data)}`);
      }
      adminToken = res.data.token;
      if (res.data.user.role !== 'admin') throw new Error(`Expected role 'admin'`);
    });

    // 7. Admin Analytics
    await testCase('GET /api/admin/analytics should return KPIs and branch breakdowns', async () => {
      const res = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/admin/analytics',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (res.status !== 200 || !res.data.analytics) {
        throw new Error(`Analytics fetch failed with status ${res.status}`);
      }
      if (!res.data.analytics.total_students || !res.data.analytics.branchStats) {
        throw new Error('Analytics payload missing essential stats fields');
      }
    });

    // 8. Role-based security barrier test
    await testCase('Accessing Admin endpoint with Student token must return 403 Forbidden', async () => {
      const res = await request({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/admin/analytics',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });

      if (res.status !== 403) {
        throw new Error(`Expected status 403 Forbidden, got ${res.status}`);
      }
    });

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
