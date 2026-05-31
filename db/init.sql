CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL
);

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department_id INTEGER REFERENCES departments(id),
  role TEXT NOT NULL,
  salary NUMERIC(10, 2) NOT NULL,
  hire_date DATE NOT NULL
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  budget NUMERIC(12, 2) NOT NULL
);

CREATE TABLE employee_projects (
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  project_id INTEGER NOT NULL REFERENCES projects(id),
  assigned_on DATE NOT NULL,
  hours_per_week INTEGER NOT NULL,
  PRIMARY KEY (employee_id, project_id)
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  segment TEXT NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  order_date DATE NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL
);

CREATE USER sql_dojo_reader WITH PASSWORD 'sql_dojo_reader';
GRANT CONNECT ON DATABASE sql_dojo TO sql_dojo_reader;
GRANT USAGE ON SCHEMA public TO sql_dojo_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sql_dojo_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO sql_dojo_reader;
