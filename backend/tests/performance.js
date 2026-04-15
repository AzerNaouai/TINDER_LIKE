import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Configuration
export const options = {
    // Stage 1: Ramp up to 50 virtual users over 5 seconds
    // Stage 2: Stay at 50 users for 10 seconds
    // Stage 3: Ramp down to 0 users over 5 seconds
    stages: [
        { duration: '5s', target: 5 },
        { duration: '10s', target: 5 },
        { duration: '5s', target: 0 },
    ],
    thresholds: {
        // 95% of requests must finish within 200ms
        http_req_duration: ['p(95)<200'], 
        // Error rate must be less than 1%
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    // Hit our locally running PHP backend API
    const res = http.get('http://127.0.0.1:8002/api/hello');

    // Assert that our API is responding correctly
    check(res, {
        'status is 200': (r) => r.status === 200,
        'has correct JSON message': (r) => r.body.includes('Hello from PHP Backend!'),
    });

    // Simulate real user interaction delays
    sleep(0.1);
}
