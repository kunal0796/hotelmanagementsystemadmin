const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    console.log('=== AUTH CHECK ===');
    console.log('Session exists:', !!req.session);
    console.log('Session loggedIn:', req.session.loggedIn);
    console.log('Session user:', req.session.user);
    console.log('==================');
    
    if (req.session.loggedIn) {
        console.log('✅ Authentication passed');
        next();
    } else {
        console.log('❌ Authentication failed - redirecting to login');
        res.redirect('/login');
    }
};

// Apply authentication middleware to all admin routes
router.use(isAuthenticated);

// Dashboard route
router.get('/dashboard', async (req, res) => {
    console.log('=== DASHBOARD ROUTE ===');
    console.log('User accessing dashboard:', req.session.user);
    
    try {
        // Get counts
        const [employeeCount] = await pool.execute('SELECT COUNT(*) as count FROM employees');
        const [roomCount] = await pool.execute('SELECT COUNT(*) as count FROM rooms');
        const [driverCount] = await pool.execute('SELECT COUNT(*) as count FROM drivers');
        const [customerCount] = await pool.execute('SELECT COUNT(*) as count FROM customers');
        const [departmentCount] = await pool.execute('SELECT COUNT(*) as count FROM departments');
        
        // Get top 5 records for each table
        const [topEmployees] = await pool.execute(
            'SELECT id, name, position, email FROM employees ORDER BY id DESC LIMIT 5'
        );
        const [topRooms] = await pool.execute(
            'SELECT id, room_number, type, status, price FROM rooms ORDER BY id DESC LIMIT 5'
        );
        const [topDrivers] = await pool.execute(
            'SELECT id, name, license_number, phone FROM drivers ORDER BY id DESC LIMIT 5'
        );
        const [topCustomers] = await pool.execute(
            'SELECT id, name, email, phone, address FROM customers ORDER BY id DESC LIMIT 5'
        );

        const [topDepartments] = await pool.execute(
            'SELECT id, name, manager FROM departments ORDER BY id DESC LIMIT 5'
        );
        
        res.render('admin-dashboard', {
            title: 'Dashboard - Hotel Management System',
            user: req.session.user,
            counts: {
                employees: employeeCount[0].count,
                rooms: roomCount[0].count,
                drivers: driverCount[0].count,
                customers: customerCount[0].count,
                departments: departmentCount[0].count
            },
            topEmployees,
            topRooms,
            topDrivers,
            topCustomers,
            topDepartments
        });
        
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Dashboard error: ' + error.message);
    }
});

// Mount entity routes
const employeeRoutes = require('./employee');
const roomRoutes = require('./room');
const driverRoutes = require('./driver');
const departmentRoutes = require('./department');
const customerRoutes = require('./customer'); // ✅ newly added route file

router.use('/employee', employeeRoutes);
router.use('/room', roomRoutes);
router.use('/driver', driverRoutes);
router.use('/department', departmentRoutes);
router.use('/customer', customerRoutes); // ✅ now properly mounted

module.exports = router;
