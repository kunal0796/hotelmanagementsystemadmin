const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Debug route to show all users (remove in production)
router.get('/debug/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT username, password, name FROM admin_users');
        res.json(rows);
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Login route with extensive debugging
router.post('/login', async (req, res) => {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Request body:', req.body);
    
    const { username, password } = req.body;
    
    console.log('Username:', username);
    console.log('Password provided:', password ? 'YES' : 'NO');
    
    try {
        // Check database connection
        console.log('Checking database connection...');
        const [testRows] = await pool.execute('SELECT 1');
        console.log('Database connection: OK');
        
        // Find user
        console.log('Looking for user:', username);
        const [rows] = await pool.execute(
            'SELECT * FROM admin_users WHERE username = ?',
            [username]
        );
        
        console.log('Users found:', rows.length);
        
        if (rows.length === 0) {
            console.log('ERROR: No user found');
            return res.render('login', { 
                error: 'Invalid username or password - User not found',
                title: 'Admin Login - Hotel Management System'
            });
        }
        
        const user = rows[0];
        console.log('User data:', {
            id: user.id,
            username: user.username,
            name: user.name,
            password_length: user.password ? user.password.length : 0
        });
        
        // Simple password comparison (no bcrypt)
        console.log('Comparing passwords...');
        console.log('Input password:', password);
        console.log('Stored password:', user.password);
        
        const isMatch = (password === user.password);
        console.log('Password match:', isMatch ? 'YES' : 'NO');
        
        if (!isMatch) {
            console.log('ERROR: Password does not match');
            return res.render('login', { 
                error: 'Invalid username or password - Wrong password',
                title: 'Admin Login - Hotel Management System'
            });
        }
        
        // Success!
        console.log('SUCCESS: Login successful');
        
        // Set session
        req.session.loggedIn = true;
        req.session.user = {
            id: user.id,
            username: user.username,
            name: user.name
        };
        
        console.log('Session created:', req.session.user);
        console.log('=== LOGIN ATTEMPT END ===');
        
        res.redirect('/admin/dashboard');
        
    } catch (error) {
        console.error('Login error:', error);
        console.log('=== LOGIN ATTEMPT END WITH ERROR ===');
        res.render('login', { 
            error: 'Database error: ' + error.message,
            title: 'Admin Login - Hotel Management System'
        });
    }
});

module.exports = router;