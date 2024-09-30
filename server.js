const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt: jwtMW } = require('express-jwt'); 
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const secretKey = 'My super secret key';

const jwtMiddleware = jwtMW({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'brian',
        password: '123'
    },
    {
        id: 2,
        username: 'nguyen',
        password: '456'
    }
];

// Login Route (JWT expires in 3 minutes)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            res.json({
                success: true,
                err: null,
                token
            });
            return;
        }
    }
    res.status(401).json({
        success: false,
        token: null,
        err: 'Username or password is incorrect'
    });
});

// Protected Dashboard Route
app.get('/api/dashboard', jwtMiddleware, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

// Protected Settings Route
app.get('/api/settings', jwtMiddleware, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the Settings page. Only logged-in users can access it.'
    });
});

// Public Route (serving the index.html file)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle Unauthorized Errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Unauthorized access - Token is invalid or expired'
        });
    } else {
        next(err);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
