const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.loggedIn) next();
    else res.redirect('/login');
};

router.use(isAuthenticated);

// 📋 GET /admin/customer - List all customers
router.get('/', async (req, res) => {
    try {
        const [customers] = await pool.execute(
            'SELECT id, name, email, phone, address FROM customers ORDER BY id DESC'
        );

        res.render('customers', {
            title: 'Customers - Hotel Management System',
            user: req.session.user,
            customers
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).send('Error fetching customers: ' + error.message);
    }
});

// ➕ GET /admin/customer/add - Show add form
router.get('/add', (req, res) => {
    res.render('customer-form', {
        title: 'Add Customer - Hotel Management System',
        user: req.session.user,
        customer: null,
        action: 'add'
    });
});

// 🧾 POST /admin/customer - Create new
router.post('/', async (req, res) => {
    const { name, email, phone, address, room_number, check_in_date, check_out_date } = req.body;
    try {
        await pool.execute(
            `INSERT INTO customers (name, email, phone, address, room_number, check_in_date, check_out_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone, address, room_number, check_in_date, check_out_date]
        );
        res.redirect('/admin/customer');
    } catch (error) {
        console.error('Error adding customer:', error);
        res.status(500).send('Error adding customer: ' + error.message);
    }
});

// ✏️ GET /admin/customer/edit/:id - Show edit form
router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [customers] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
        if (customers.length === 0) return res.status(404).send('Customer not found');

        res.render('customer-form', {
            title: 'Edit Customer - Hotel Management System',
            user: req.session.user,
            customer: customers[0],
            action: 'edit'
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).send('Error fetching customer: ' + error.message);
    }
});

// 🔄 POST /admin/customer/edit/:id - Update
router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, room_number, check_in_date, check_out_date } = req.body;
    try {
        await pool.execute(
            `UPDATE customers 
             SET name=?, email=?, phone=?, address=?, room_number=?, check_in_date=?, check_out_date=? 
             WHERE id=?`,
            [name, email, phone, address, room_number, check_in_date, check_out_date, id]
        );
        res.redirect('/admin/customer');
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).send('Error updating customer: ' + error.message);
    }
});

// ❌ POST /admin/customer/delete/:id - Delete
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
        res.redirect('/admin/customer');
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).send('Error deleting customer: ' + error.message);
    }
});

module.exports = router;
