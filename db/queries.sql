-- Sample query to retrieve all departments
SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;

-- Sample query to retrieve all roles
SELECT * FROM role;

-- Sample query to retrieve all employees
SELECT * FROM employee;

-- Sample query to retrieve employees in a specific department
SELECT * FROM employee WHERE role_id IN (SELECT id FROM role WHERE department_id = ?);

-- Sample query to insert a new department
INSERT INTO department (name) VALUES ('Marketing');

-- Sample query to insert a new role
INSERT INTO role (title, salary, department_id) VALUES ('Sales Manager', 70000, 1);

-- Sample query to update an employee's role
UPDATE employee SET role_id = 2 WHERE id = 1;

