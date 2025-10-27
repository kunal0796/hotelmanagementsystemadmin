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

// GET /admin/employee - List all employees
router.get('/', async (req, res) => {
    try {
        const [employees] = await pool.execute(
            'SELECT id, name, position, email, phone, salary, hire_date FROM employees ORDER BY id DESC'
        );
        res.render('employees', {
            title: 'Employees - Hotel Management System',
            user: req.session.user,
            employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).send('Error fetching employees: ' + error.message);
    }
});

// GET /admin/employee/add - Show add employee form
router.get('/add', (req, res) => {
    res.render('employee-form', {
        title: 'Add Employee - Hotel Management System',
        user: req.session.user,
        employee: null,
        action: 'add'
    });
});

// POST /admin/employee - Create new employee
router.post('/', async (req, res) => {
    const { name, position, email, phone, salary, hire_date } = req.body;
    try {
        await pool.execute(
            'INSERT INTO employees (name, position, email, phone, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?)',
            [name, position, email, phone, salary, hire_date]
        );
        res.redirect('/admin/employee');
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).send('Error creating employee: ' + error.message);
    }
});

// GET /admin/employee/edit/:id - Show edit employee form
router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [employees] = await pool.execute(
            'SELECT * FROM employees WHERE id = ?',
            [id]
        );
        if (employees.length === 0) {
            return res.status(404).send('Employee not found');
        }
        res.render('employee-form', {
            title: 'Edit Employee - Hotel Management System',
            user: req.session.user,
            employee: employees[0],
            action: 'edit'
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).send('Error fetching employee: ' + error.message);
    }
});

// POST /admin/employee/edit/:id - Update employee
router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { name, position, email, phone, salary, hire_date } = req.body;
    try {
        await pool.execute(
            'UPDATE employees SET name = ?, position = ?, email = ?, phone = ?, salary = ?, hire_date = ? WHERE id = ?',
            [name, position, email, phone, salary, hire_date, id]
        );
        res.redirect('/admin/employee');
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).send('Error updating employee: ' + error.message);
    }
});

// POST /admin/employee/delete/:id - Delete employee
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
        res.redirect('/admin/employee');
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).send('Error deleting employee: ' + error.message);
    }
});

module.exports = router;

