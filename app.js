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

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin/dashboard`);
});