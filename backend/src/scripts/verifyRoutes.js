const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const makeRequest = (options) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting API Route Verification Tests...\n');

  const tests = [
    {
      name: 'General health check (GET /api/health)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/health',
        method: 'GET'
      },
      verify: (res) => res.statusCode === 200 && res.body.status === 'success'
    },
    {
      name: 'System health check (GET /api/v1/datasets/system/health)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/datasets/system/health',
        method: 'GET'
      },
      verify: (res) => res.statusCode === 200 && res.body.status === 'success' && res.body.message.includes('healthy')
    },
    {
      name: 'OPTIONS /datasets/system/health (Allows GET, OPTIONS, HEAD)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/datasets/system/health',
        method: 'OPTIONS'
      },
      verify: (res) => res.statusCode === 200 && res.headers['allow'] && res.headers['allow'].includes('GET')
    },
    {
      name: 'OPTIONS /auth/login (Allows POST, OPTIONS, HEAD)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/auth/login',
        method: 'OPTIONS'
      },
      verify: (res) => res.statusCode === 200 && res.headers['allow'] && res.headers['allow'].includes('POST')
    },
    {
      name: 'OPTIONS /search/datasets (Allows GET, OPTIONS, HEAD)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/search/datasets',
        method: 'OPTIONS'
      },
      verify: (res) => res.statusCode === 200 && res.headers['allow'] && res.headers['allow'].includes('GET')
    },
    {
      name: 'OPTIONS /jwt/profile (Allows GET, OPTIONS, HEAD)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/jwt/profile',
        method: 'OPTIONS'
      },
      verify: (res) => res.statusCode === 200 && res.headers['allow'] && res.headers['allow'].includes('GET')
    },
    {
      name: 'OPTIONS /admin/datasets (Allows GET, OPTIONS, HEAD)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/admin/datasets',
        method: 'OPTIONS'
      },
      verify: (res) => res.statusCode === 200 && res.headers['allow'] && res.headers['allow'].includes('GET')
    },
    {
      name: 'Dataset list query with flat filter mapping (?type=function)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/datasets?type=function',
        method: 'GET'
      },
      verify: (res) => {
        if (res.statusCode !== 200) return false;
        const datasets = res.body.data.datasets;
        return Array.isArray(datasets) && datasets.every(d => d.metadata.type === 'function');
      }
    },
    {
      name: 'Dataset list sorting mapping (?sort=-repo)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/datasets?sort=-repo&limit=5',
        method: 'GET'
      },
      verify: (res) => {
        if (res.statusCode !== 200) return false;
        const datasets = res.body.data.datasets;
        if (!Array.isArray(datasets) || datasets.length < 2) return true;
        // Verify they are sorted in descending order of repo_name
        for (let i = 0; i < datasets.length - 1; i++) {
          const r1 = datasets[i].metadata.repo_name || '';
          const r2 = datasets[i+1].metadata.repo_name || '';
          if (r1.localeCompare(r2) < 0) return false;
        }
        return true;
      }
    },
    {
      name: 'Special regex criteria mapping (?language=python)',
      options: {
        host: 'localhost',
        port: PORT,
        path: '/api/v1/datasets?language=python&limit=5',
        method: 'GET'
      },
      verify: (res) => {
        if (res.statusCode !== 200) return false;
        const datasets = res.body.data.datasets;
        return Array.isArray(datasets) && datasets.every(d => {
          const source = (d.metadata.source_type || '').toLowerCase();
          const path = (d.metadata.file_path || '').toLowerCase();
          const instr = (d.instruction || '').toLowerCase();
          return source.includes('python') || path.endsWith('.py') || instr.includes('python');
        });
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = await makeRequest(test.options);
      const isOk = test.verify(result);
      if (isOk) {
        console.log(`✅ [PASS] ${test.name}`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${test.name}`);
        console.error(`   Status Code: ${result.statusCode}`);
        console.error(`   Headers:`, result.headers);
        console.error(`   Body:`, JSON.stringify(result.body, null, 2));
      }
    } catch (err) {
      console.error(`❌ [FAIL] ${test.name} - Connection error: ${err.message}`);
    }
  }

  console.log(`\n📊 Verification Summary: ${passed}/${tests.length} tests passed.`);
  if (passed === tests.length) {
    console.log('🎉 All routes verified successfully!');
    process.exit(0);
  } else {
    console.error('⚠️ Some tests failed. Please check the logs.');
    process.exit(1);
  }
};

runTests();
