-- =====================================================================
-- Sample data for local development / demos.
-- The admin account is NOT seeded here on purpose -- it is created
-- automatically by the backend on first startup, with the password
-- hashed via bcrypt (see backend/utils/seedAdmin.js). This avoids ever
-- committing a real password hash to source control.
-- =====================================================================

USE formapp_db;

INSERT INTO submissions (full_name, email, phone, subject, message, status, ip_address, created_at) VALUES
('Ananya Sharma',  'ananya.sharma@example.com',  '9876543210', 'General Enquiry',   'I would like to know more about your services.', 'new',      '49.207.10.1',  NOW() - INTERVAL 1 DAY),
('Karthik Raja',   'karthik.raja@example.com',   '9123456780', 'Support Request',   'Facing an issue while submitting the form on mobile.', 'reviewed', '49.207.10.2',  NOW() - INTERVAL 2 DAY),
('Priya Menon',    'priya.menon@example.com',    '9988776655', 'Feedback',          'Great experience, thank you for the quick response!', 'resolved', '49.207.10.3',  NOW() - INTERVAL 3 DAY),
('Rahul Verma',    'rahul.verma@example.com',    '9012345678', 'Partnership',       'Interested in discussing a potential partnership.', 'new',      '49.207.10.4',  NOW() - INTERVAL 5 DAY),
('Sneha Iyer',     'sneha.iyer@example.com',     '9765432109', 'General Enquiry',   'Please share your pricing details.', 'new',      '49.207.10.5',  NOW() - INTERVAL 7 DAY);
