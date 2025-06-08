// Use built-in fetch (Node.js 18+) or fallback to https module
let fetch;
try {
    fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
    // Fallback for older Node.js versions
    const https = require('https');
    const http = require('http');
    
    fetch = (url, options = {}) => {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const req = client.request({
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: options.headers || {}
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: new Map(Object.entries(res.headers)),
                        text: () => Promise.resolve(data),
                        json: () => Promise.resolve(JSON.parse(data))
                    });
                });
            });
            
            req.on('error', reject);
            if (options.body) req.write(options.body);
            req.end();
        });
    };
}

async function testOrderCreation() {
    console.log('Testing order creation API...\n');
    
    const testOrderData = {
        orderItems: [
            {
                name: "Margherita Pizza",
                image: "1.png", // Now properly included
                uploadedImage: ["https://example.com/uploaded_image1.jpg"],
                quantity: 1,
                price: "12",
                product: "1" // This should be converted to ObjectId
            },
            {
                name: "Beef Burger", 
                image: "2.png", // Now properly included
                uploadedImage: ["https://example.com/uploaded_image2.jpg", "https://example.com/uploaded_image3.jpg"],
                quantity: 2,
                price: "5", 
                product: "2" // This should be converted to ObjectId
            }
        ],
        shippingInfo: {
            name: "Test User",
            address: "123 Test Street",
            city: "Test City", 
            state: "Test State",
            phoneNo: "1234567890",
            pinCode: "12345",
            country: "India",
            email: "test@example.com"
        },
        itemsPrice: 22,
        taxAmount: 0,
        shippingAmount: 0,
        totalAmount: 22,
        paymentMethod: "COD",
        paymentInfo: {
            id: "test_payment_123",
            status: "COD"
        }
    };

    try {
        console.log('Sending POST request to http://localhost:3000/api/orders/createOrder\n');
        
        const response = await fetch('http://localhost:3000/api/orders/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testOrderData)
        });

        const responseText = await response.text();
        console.log('Response Status:', response.status);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
        console.log('Raw Response:', responseText);

        if (response.status >= 200 && response.status < 300) {
            try {
                const result = JSON.parse(responseText);
                console.log('\n✅ SUCCESS: Order created successfully!');
                console.log('Order ID:', result.order?._id);
                console.log('Order Details:', JSON.stringify(result, null, 2));
            } catch (parseError) {
                console.log('\n✅ SUCCESS: Order created (non-JSON response)');
                console.log('Response:', responseText);
            }
        } else {
            console.log('\n❌ ERROR: Order creation failed');
            console.log('Status:', response.status);
            try {
                const errorResult = JSON.parse(responseText);
                console.log('Error Details:', JSON.stringify(errorResult, null, 2));
            } catch (parseError) {
                console.log('Error Response:', responseText);
            }
        }

    } catch (error) {
        console.log('\n❌ NETWORK ERROR:', error.message);
        console.log('Make sure the backend server is running on http://localhost:3000');
    }
}

// Wait a moment for servers to be ready, then test
setTimeout(testOrderCreation, 3000);
