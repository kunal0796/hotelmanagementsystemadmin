const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.loggedIn) next();
    else res.redirect('/login');
};

router.use(isAuthenticated);

// GET /admin/department - list all departments
router.get('/', async (req, res) => {
    try {
        const [departments] = await pool.execute(
            'SELECT id, name, manager, description, created_at FROM departments ORDER BY id DESC'
        );
        // 👇 Change 'departments' to 'department' to match your EJS file name
        res.render('department', {
            title: 'Departments - Hotel Management System',
            user: req.session.user,
            departments // ✅ this variable is passed correctly to department.ejs
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).send('Error fetching departments: ' + error.message);
    }
});

// GET /admin/department/add - show add form
router.get('/add', (req, res) => {
    res.render('department-form', {
        title: 'Add Department - Hotel Management System',
        user: req.session.user,
        department: null,
        action: 'add'
    });
});

// POST /admin/department - create new
router.post('/', async (req, res) => {
    const { name, manager, description } = req.body;
    try {
        await pool.execute(
            'INSERT INTO departments (name, manager, description) VALUES (?, ?, ?)',
            [name, manager, description]
        );
        res.redirect('/admin/department');
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).send('Error creating department: ' + error.message);
    }
});

// GET /admin/department/edit/:id - show edit form
router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [departments] = await pool.execute('SELECT * FROM departments WHERE id = ?', [id]);
        if (departments.length === 0) return res.status(404).send('Department not found');
        res.render('department-form', {
            title: 'Edit Department - Hotel Management System',
            user: req.session.user,
            department: departments[0],
            action: 'edit'
        });
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).send('Error fetching department: ' + error.message);
    }
});

// POST /admin/department/edit/:id - update
router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { name, manager, description } = req.body;
    try {
        await pool.execute(
            'UPDATE departments SET name = ?, manager = ?, description = ? WHERE id = ?',
            [name, manager, description, id]
        );
        res.redirect('/admin/department');
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).send('Error updating department: ' + error.message);
    }
});

// POST /admin/department/delete/:id - delete
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
        res.redirect('/admin/department');
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).send('Error deleting department: ' + error.message);
    }
});

module.exports = router;
