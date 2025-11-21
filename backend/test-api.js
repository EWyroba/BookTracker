const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

function testEndpoint(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`✅ ${method} ${path}: ${res.statusCode}`);
                try {
                    const jsonData = JSON.parse(data);
                    console.log('   Response:', jsonData);
                } catch (e) {
                    console.log('   Response:', data);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${method} ${path}:`, error.message);
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing BookTracker API...\n');

    try {
        // Test 1: Health Check
        await testEndpoint('GET', '/health');

        // Test 2: Register
        await testEndpoint('POST', '/auth/register', {
            nazwa_uzytkownika: 'testuser',
            email: 'test@example.com',
            password: 'test123',
            nazwa_wyswietlana: 'Test User'
        });

        // Test 3: Login
        await testEndpoint('POST', '/auth/login', {
            email: 'test@example.com',
            password: 'test123'
        });

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        console.log('\n💥 Some tests failed');
    }
}

// Run if server is running
setTimeout(() => {
    runTests();
}, 1000);