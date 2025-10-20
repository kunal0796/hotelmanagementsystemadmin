-- Create database
CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT INTO admin_users (username, password, name) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator');

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    salary DECIMAL(10,2),
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample employees
INSERT INTO employees (name, position, email, phone, salary, hire_date) VALUES
('John Smith', 'Front Desk Manager', 'john@hotel.com', '555-0101', 45000.00, '2023-01-15'),
('Sarah Johnson', 'Housekeeping Supervisor', 'sarah@hotel.com', '555-0102', 38000.00, '2023-02-20'),
('Mike Wilson', 'Maintenance Engineer', 'mike@hotel.com', '555-0103', 42000.00, '2023-03-10'),
('Emily Brown', 'Receptionist', 'emily@hotel.com', '555-0104', 32000.00, '2023-04-05'),
('David Lee', 'Chef', 'david@hotel.com', '555-0105', 55000.00, '2023-05-12');

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    price DECIMAL(10,2) NOT NULL,
    floor INT,
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample rooms
INSERT INTO rooms (room_number, type, status, price, floor, capacity) VALUES
('101', 'Single', 'Available', 99.00, 1, 1),
('102', 'Single', 'Occupied', 99.00, 1, 1),
('201', 'Double', 'Available', 149.00, 2, 2),
('202', 'Double', 'Available', 149.00, 2, 2),
('301', 'Suite', 'Occupied', 299.00, 3, 4);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample drivers
INSERT INTO drivers (name, license_number, phone, vehicle_type, available) VALUES
('Robert Garcia', 'DL123456', '555-0201', 'Sedan', TRUE),
('Lisa Martinez', 'DL789012', '555-0202', 'Van', TRUE),
('James Anderson', 'DL345678', '555-0203', 'SUV', FALSE),
('Maria Rodriguez', 'DL901234', '555-0204', 'Sedan', TRUE),
('Thomas White', 'DL567890', '555-0205', 'Van', TRUE);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample customers
INSERT INTO customers (name, email, phone, address) VALUES
('Alice Cooper', 'alice@email.com', '555-0301', '123 Main St, City'),
('Bob Taylor', 'bob@email.com', '555-0302', '456 Oak Ave, Town'),
('Carol Davis', 'carol@email.com', '555-0303', '789 Pine Rd, Village'),
('Daniel Miller', 'daniel@email.com', '555-0304', '321 Elm St, City'),
('Eva Wilson', 'eva@email.com', '555-0305', '654 Maple Dr, Town');

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    manager VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample departments
INSERT INTO departments (name, manager, description) VALUES
('Front Office', 'John Smith', 'Handles check-in, check-out, and guest services'),
('Housekeeping', 'Sarah Johnson', 'Maintains cleanliness and hygiene of the hotel'),
('Maintenance', 'Mike Wilson', 'Manages building maintenance and repairs'),
('Food & Beverage', 'David Lee', 'Overseas restaurant and room service operations'),
('Security', 'Robert Garcia', 'Ensures safety and security of guests and property');

