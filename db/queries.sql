-- Sample query to retrieve all departments with formatted output
SELECT id, name AS department_name FROM department;

-- Sample query to retrieve all roles with formatted output
SELECT role.id, role.title, department.name AS department_name, role.salary 
FROM role
JOIN department ON role.department_id = department.id;

-- Sample query to retrieve all employees with formatted output
SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department_name, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
LEFT JOIN employee AS manager ON employee.manager_id = manager.id;

-- Sample query to add a department
INSERT INTO department (name) VALUES ('Marketing');

-- Sample query to add a role
-- In a real application, you would prompt the user for input for the role name, salary, and department_id.
-- For this example, we'll use static values.
INSERT INTO role (title, salary, department_id) VALUES ('Sales Manager', 70000, 1);

-- Sample query to add an employee
-- In a real application, you would prompt the user for input for the employee's first name, last name, role_id, and manager_id.
-- For this example, we'll use static values.
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('John', 'Doe', 1, NULL);

-- Sample query to update an employee's role
-- In a real application, you would prompt the user for input to select the employee and the new role.
-- For this example, we'll use static values.
UPDATE employee SET role_id = 2 WHERE id = 1;
