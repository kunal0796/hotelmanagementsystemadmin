const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// GET /admin/driver - List all drivers
router.get('/', async (req, res) => {
    try {
        const [drivers] = await pool.execute(
            'SELECT id, name, license_number, phone, vehicle_type, available FROM drivers ORDER BY id DESC'
        );
        res.render('drivers', {
            title: 'Drivers - Hotel Management System',
            user: req.session.user,
            drivers
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).send('Error fetching drivers: ' + error.message);
    }
});

// GET /admin/driver/add - Show add driver form
router.get('/add', (req, res) => {
    res.render('driver-form', {
        title: 'Add Driver - Hotel Management System',
        user: req.session.user,
        driver: null,
        action: 'add'
    });
});

// POST /admin/driver - Create new driver
router.post('/', async (req, res) => {
    const { name, license_number, phone, vehicle_type, available } = req.body;
    try {
        await pool.execute(
            'INSERT INTO drivers (name, license_number, phone, vehicle_type, available) VALUES (?, ?, ?, ?, ?)',
            [name, license_number, phone, vehicle_type, available === 'on' ? 1 : 0]
        );
        res.redirect('/admin/driver');
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).send('Error creating driver: ' + error.message);
    }
});

// GET /admin/driver/edit/:id - Show edit driver form
router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [drivers] = await pool.execute(
            'SELECT * FROM drivers WHERE id = ?',
            [id]
        );
        if (drivers.length === 0) {
            return res.status(404).send('Driver not found');
        }
        res.render('driver-form', {
            title: 'Edit Driver - Hotel Management System',
            user: req.session.user,
            driver: drivers[0],
            action: 'edit'
        });
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).send('Error fetching driver: ' + error.message);
    }
});

// POST /admin/driver/edit/:id - Update driver
router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { name, license_number, phone, vehicle_type, available } = req.body;
    try {
        await pool.execute(
            'UPDATE drivers SET name = ?, license_number = ?, phone = ?, vehicle_type = ?, available = ? WHERE id = ?',
            [name, license_number, phone, vehicle_type, available === 'on' ? 1 : 0, id]
        );
        res.redirect('/admin/driver');
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).send('Error updating driver: ' + error.message);
    }
});

// POST /admin/driver/delete/:id - Delete driver
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM drivers WHERE id = ?', [id]);
        res.redirect('/admin/driver');
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).send('Error deleting driver: ' + error.message);
    }
});

module.exports = router;
