INSERT INTO departments (name, location) VALUES
  ('Engineering', 'Manila'),
  ('Sales', 'Cebu'),
  ('Operations', 'Davao'),
  ('Finance', 'Makati'),
  ('Support', 'Quezon City');

INSERT INTO employees (first_name, last_name, email, department_id, role, salary, hire_date) VALUES
  ('Ana', 'Santos', 'ana.santos@example.com', 1, 'Backend Developer', 92000.00, '2021-03-15'),
  ('Miguel', 'Reyes', 'miguel.reyes@example.com', 1, 'Frontend Developer', 88000.00, '2022-01-10'),
  ('Leah', 'Cruz', 'leah.cruz@example.com', 2, 'Account Executive', 76000.00, '2020-07-22'),
  ('Paolo', 'Garcia', 'paolo.garcia@example.com', 3, 'Operations Lead', 84000.00, '2019-11-04'),
  ('Nina', 'Lim', 'nina.lim@example.com', 4, 'Financial Analyst', 80000.00, '2021-09-01'),
  ('Carlo', 'Dizon', 'carlo.dizon@example.com', 5, 'Support Specialist', 62000.00, '2023-02-18'),
  ('Maya', 'Tan', 'maya.tan@example.com', 2, 'Sales Manager', 98000.00, '2018-05-30'),
  ('Rafi', 'Torres', 'rafi.torres@example.com', 1, 'Data Engineer', 101000.00, '2020-10-12');

INSERT INTO projects (name, status, budget) VALUES
  ('Analytics Portal', 'active', 650000.00),
  ('Customer CRM Migration', 'active', 420000.00),
  ('Billing Automation', 'planning', 300000.00),
  ('Support Knowledge Base', 'completed', 180000.00);

INSERT INTO employee_projects (employee_id, project_id, assigned_on, hours_per_week) VALUES
  (1, 1, '2024-01-08', 24),
  (2, 1, '2024-01-08', 24),
  (8, 1, '2024-01-15', 20),
  (3, 2, '2024-02-01', 16),
  (7, 2, '2024-02-01', 18),
  (5, 3, '2024-03-11', 12),
  (4, 3, '2024-03-11', 10),
  (6, 4, '2023-08-21', 18);

INSERT INTO customers (name, city, segment) VALUES
  ('Northwind Traders', 'Manila', 'enterprise'),
  ('Blue Harbor Cafe', 'Cebu', 'small business'),
  ('Island Retail Group', 'Davao', 'mid-market'),
  ('Metro Health Supply', 'Makati', 'enterprise'),
  ('Sunrise Books', 'Quezon City', 'small business');

INSERT INTO orders (customer_id, order_date, status) VALUES
  (1, '2024-01-12', 'paid'),
  (2, '2024-01-19', 'paid'),
  (3, '2024-02-03', 'shipped'),
  (4, '2024-02-15', 'paid'),
  (1, '2024-03-04', 'pending'),
  (5, '2024-03-20', 'paid'),
  (3, '2024-04-02', 'cancelled');

INSERT INTO sales (order_id, product, category, quantity, unit_price) VALUES
  (1, 'SQL Fundamentals Seat', 'training', 12, 149.00),
  (1, 'Analytics Starter Pack', 'software', 3, 499.00),
  (2, 'SQL Fundamentals Seat', 'training', 4, 149.00),
  (3, 'Reporting Dashboard', 'software', 2, 899.00),
  (4, 'Data Quality Audit', 'services', 1, 2500.00),
  (5, 'Analytics Starter Pack', 'software', 1, 499.00),
  (6, 'SQL Fundamentals Seat', 'training', 2, 149.00),
  (6, 'Reporting Dashboard', 'software', 1, 899.00),
  (7, 'Data Quality Audit', 'services', 1, 2500.00);
