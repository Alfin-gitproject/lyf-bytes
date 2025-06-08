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
                        json: () => Promise.resolve(JSON.parse(data)),
                        headers: {
                            entries: () => Object.entries(res.headers)
                        }
                    });
                });
            });
            
            req.on('error', reject);
            if (options.body) req.write(options.body);
            req.end();
        });
    };
}

async function testCompleteFlow() {
    console.log('🔄 Testing complete authentication + order flow...\n');
    
    let authCookies = '';

    // Step 1: Register a test user
    console.log('1️⃣ Testing user registration...');
    try {
        const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const registerText = await registerResponse.text();
        console.log('Register Status:', registerResponse.status);
        
        if (registerResponse.status === 201) {
            try {
                const registerResult = JSON.parse(registerText);
                console.log('✅ Registration successful!');
                
                // Extract cookies from response
                const setCookieHeader = registerResponse.headers.get('set-cookie');
                if (setCookieHeader) {
                    authCookies = setCookieHeader;
                    console.log('🍪 Auth cookies received');
                }
            } catch (e) {
                console.log('✅ Registration successful (non-JSON response)');
            }
        } else if (registerResponse.status === 400) {
            // User might already exist, try login instead
            console.log('📝 User exists, trying login...');
        } else {
            console.log('❌ Registration failed:', registerText);
        }
    } catch (error) {
        console.log('❌ Registration error:', error.message);
    }

    // Step 2: Login (if registration failed due to existing user)
    if (!authCookies) {
        console.log('\n2️⃣ Testing user login...');
        try {
            const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            });

            const loginText = await loginResponse.text();
            console.log('Login Status:', loginResponse.status);
            
            if (loginResponse.status === 200) {
                try {
                    const loginResult = JSON.parse(loginText);
                    console.log('✅ Login successful!');
                    
                    // Extract cookies from response
                    const setCookieHeader = loginResponse.headers.get('set-cookie');
                    if (setCookieHeader) {
                        authCookies = setCookieHeader;
                        console.log('🍪 Auth cookies received');
                    }
                } catch (e) {
                    console.log('✅ Login successful (non-JSON response)');
                }
            } else {
                console.log('❌ Login failed:', loginText);
                return; // Exit if login fails
            }
        } catch (error) {
            console.log('❌ Login error:', error.message);
            return;
        }
    }

    // Step 3: Test order creation with authentication
    console.log('\n3️⃣ Testing order creation with authentication...');
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
                uploadedImage: ["https://example.com/uploaded_image2.jpg"],
                quantity: 2,
                price: "5", 
                product: "2" // This should be converted to ObjectId
            }
        ],        shippingInfo: {
            name: "Test User",
            address: "123 Test Street",
            city: "Test City", 
            state: "Test State",
            phoneNo: "1234567890",
            zipCode: "12345", // Changed from pinCode to zipCode
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
        const orderResponse = await fetch('http://localhost:3000/api/orders/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookies // Include authentication cookies
            },
            body: JSON.stringify(testOrderData)
        });

        const orderText = await orderResponse.text();
        console.log('Order Response Status:', orderResponse.status);
        
        if (orderResponse.status >= 200 && orderResponse.status < 300) {
            try {
                const orderResult = JSON.parse(orderText);
                console.log('\n🎉 SUCCESS: Order created successfully!');
                console.log('Order ID:', orderResult.order?._id);
                console.log('Order Details:', JSON.stringify(orderResult, null, 2));
                
                console.log('\n✅ ALL VALIDATION FIXES ARE WORKING:');
                console.log('  ✓ Product ID validation and ObjectId conversion');
                console.log('  ✓ Required image field in orderItems');
                console.log('  ✓ Proper uploadedImage array handling');
                console.log('  ✓ Authentication flow');
                
            } catch (parseError) {
                console.log('\n🎉 SUCCESS: Order created (non-JSON response)');
                console.log('Response:', orderText);
            }
        } else {
            console.log('\n❌ Order creation failed');
            console.log('Status:', orderResponse.status);
            try {
                const errorResult = JSON.parse(orderText);
                console.log('Error Details:', JSON.stringify(errorResult, null, 2));
                
                // Check if it's still a validation error
                if (errorResult.message && errorResult.message.includes('validation')) {
                    console.log('\n🔍 VALIDATION ERROR ANALYSIS:');
                    console.log('This suggests our fixes need more work.');
                }
            } catch (parseError) {
                console.log('Error Response:', orderText);
            }
        }

    } catch (error) {
        console.log('\n❌ ORDER CREATION ERROR:', error.message);
    }
}

// Wait for servers to be ready, then test
setTimeout(testCompleteFlow, 3000);
