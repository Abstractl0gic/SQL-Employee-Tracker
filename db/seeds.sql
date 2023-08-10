-- Create departments
INSERT INTO department (name) VALUES
    ('Sales'),
    ('Marketing'),
    ('Engineering'),
    ('Finance'),
    ('HR');

-- Create roles
INSERT INTO role (title, salary, department_id) VALUES
    ('Sales Manager', 70000, 1),
    ('Sales Associate', 50000, 1),
    ('Marketing Manager', 65000, 2),
    ('Marketing Coordinator', 45000, 2),
    ('Software Engineer', 80000, 3),
    ('Front-end Developer', 65000, 3),
    ('Backend Developer', 70000, 3),
    ('Financial Analyst', 60000, 4),
    ('HR Manager', 70000, 5),
    ('HR Coordinator', 50000, 5);

-- Create employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Michael', 'Johnson', 3, 1),
    ('Emily', 'Williams', 4, 2),
    ('David', 'Brown', 5, 3),
    ('Sarah', 'Jones', 6, 3),
    ('Daniel', 'Davis', 7, 3),
    ('Alex', 'Martin', 8, 4),
    ('Michelle', 'Lee', 9, NULL),
    ('Christopher', 'Clark', 10, 9);
