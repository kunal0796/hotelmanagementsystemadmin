require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Session store
const sessionStore = new MySQLStore({}, pool);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'your_secret_key_here',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true
    }
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Session:`, req.session.loggedIn ? 'LOGGED IN' : 'NOT LOGGED');
    next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const roomRoutes = require('./routes/room');
const driverRoutes = require('./routes/driver');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/employee', employeeRoutes);
app.use('/admin/room', roomRoutes);
app.use('/admin/driver', driverRoutes);

// Home route - redirect to login
app.get('/', (req, res) => {
    console.log('Home route accessed');
    if (req.session.loggedIn) {
        console.log('Redirecting to dashboard');
        res.redirect('/admin/dashboard');
    } else {
        console.log('Redirecting to login');
        res.redirect('/login');
    }
});

// Login route
app.get('/login', (req, res) => {
    console.log('Login route accessed');
    if (req.session.loggedIn) {
        console.log('Already logged in, redirecting to dashboard');
        res.redirect('/admin/dashboard');
    } else {
        console.log('Showing login page');
        res.render('login', { 
            error: null,
            title: 'Admin Login - Hotel Management System'
        });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    console.log('Logout route accessed');
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/admin/dashboard');
        }
        res.clearCookie('session_cookie_name');
        console.log('Session destroyed, redirecting to login');
        res.redirect('/login');
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 - Page not found:', req.url);
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Start server with retry on EADDRINUSE
let server;
const maxRetries = 5;
let attempts = 0;
let currentPort = Number(process.env.PORT) || Number(PORT) || 3000;

function startServer(port) {
    server = app.listen(port, () => {
        process.env.PORT = port;
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📊 Admin Dashboard: http://localhost:${port}/admin/dashboard`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            attempts += 1;
            if (attempts > maxRetries) {
                console.error(`Port ${port} is in use and max retries reached. Exiting.`);
                process.exit(1);
            }
            const nextPort = port + 1;
            console.warn(`Port ${port} is in use. Trying port ${nextPort} (attempt ${attempts}/${maxRetries})...`);
            setTimeout(() => startServer(nextPort), 300);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

startServer(currentPort);

module.exports = app;