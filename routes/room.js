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

// GET /admin/room - List all rooms
router.get('/', async (req, res) => {
    try {
        const [rooms] = await pool.execute(
            'SELECT id, room_number, type, status, price, floor, capacity FROM rooms ORDER BY id DESC'
        );
        res.render('rooms', {
            title: 'Rooms - Hotel Management System',
            user: req.session.user,
            rooms
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).send('Error fetching rooms: ' + error.message);
    }
});

// GET /admin/room/add - Show add room form
router.get('/add', (req, res) => {
    res.render('room-form', {
        title: 'Add Room - Hotel Management System',
        user: req.session.user,
        room: null,
        action: 'add'
    });
});

// POST /admin/room - Create new room
router.post('/', async (req, res) => {
    const { room_number, type, status, price, floor, capacity } = req.body;
    try {
        await pool.execute(
            'INSERT INTO rooms (room_number, type, status, price, floor, capacity) VALUES (?, ?, ?, ?, ?, ?)',
            [room_number, type, status, price, floor, capacity]
        );
        res.redirect('/admin/room');
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).send('Error creating room: ' + error.message);
    }
});

// GET /admin/room/edit/:id - Show edit room form
router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rooms] = await pool.execute(
            'SELECT * FROM rooms WHERE id = ?',
            [id]
        );
        if (rooms.length === 0) {
            return res.status(404).send('Room not found');
        }
        res.render('room-form', {
            title: 'Edit Room - Hotel Management System',
            user: req.session.user,
            room: rooms[0],
            action: 'edit'
        });
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).send('Error fetching room: ' + error.message);
    }
});

// POST /admin/room/edit/:id - Update room
router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { room_number, type, status, price, floor, capacity } = req.body;
    try {
        await pool.execute(
            'UPDATE rooms SET room_number = ?, type = ?, status = ?, price = ?, floor = ?, capacity = ? WHERE id = ?',
            [room_number, type, status, price, floor, capacity, id]
        );
        res.redirect('/admin/room');
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).send('Error updating room: ' + error.message);
    }
});

// POST /admin/room/delete/:id - Delete room
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM rooms WHERE id = ?', [id]);
        res.redirect('/admin/room');
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).send('Error deleting room: ' + error.message);
    }
});

module.exports = router;
