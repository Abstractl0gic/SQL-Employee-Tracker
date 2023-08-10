const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

// Create a connection to the MySQL database
const db = mysql.createPool({
  host: 'localhost',     // Change this to your MySQL server hostname
  user: 'root',  // Change this to your MySQL username
  password: '31415',  // Change this to your MySQL password
  database: 'employee_management',  // Change this to your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to start the main application
async function startApp() {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit',
        ],
      },
    ]);

    // Based on the user's choice, call the appropriate function
    switch (answer.action) {
      case 'View all departments':
        await viewAllDepartments();
        break;
      case 'View all roles':
        await viewAllRoles();
        break;
      case 'View all employees':
        await viewAllEmployees();
        break;
      case 'Add a department':
        await addDepartment();
        break;
      case 'Add a role':
        await addRole();
        break;
      case 'Add an employee':
        await addEmployee();
        break;
      case 'Update an employee role':
        await updateEmployeeRole();
        break;
      case 'Exit':
        // Exit the application
        console.log('Goodbye!');
        process.exit();
        break;
      default:
        console.log('Invalid choice');
        break;
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Function to view all departments
async function viewAllDepartments() {
  const [rows] = await db.query('SELECT * FROM department');
  console.table(rows);
  await startApp();
}

// Function to view all roles
async function viewAllRoles() {
  const [rows] = await db.query('SELECT * FROM role');
  console.table(rows);
  await startApp();
}

// Function to view all employees
async function viewAllEmployees() {
  const [rows] = await db.query(`
    SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `);
  console.table(rows);
  await startApp();
}

// Function to add a department
async function addDepartment() {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'Enter the name of the department:',
    },
  ]);

  await db.query('INSERT INTO department (name) VALUES (?)', [answer.departmentName]);
  console.log('Department added successfully!');
  await startApp();
}

// Function to add a role
async function addRole() {
  const departments = await db.query('SELECT * FROM department');
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'roleTitle',
      message: 'Enter the title of the role:',
    },
    {
      type: 'number',
      name: 'roleSalary',
      message: 'Enter the salary for this role:',
    },
    {
      type: 'list',
      name: 'departmentId',
      message: 'Select the department for this role:',
      choices: departments[0].map((department) => ({ name: department.name, value: department.id })),
    },
  ]);

  await db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [
    answer.roleTitle,
    answer.roleSalary,
    answer.departmentId,
  ]);
  console.log('Role added successfully!');
  await startApp();
}

// Function to add an employee
async function addEmployee() {
  const roles = await db.query('SELECT * FROM role');
  const employees = await db.query('SELECT id, first_name, last_name FROM employee');
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "Enter the employee's first name:",
    },
    {
      type: 'input',
      name: 'lastName',
      message: "Enter the employee's last name:",
    },
    {
      type: 'list',
      name: 'roleId',
      message: "Select the employee's role:",
      choices: roles[0].map((role) => ({ name: role.title, value: role.id })),
    },
    {
      type: 'list',
      name: 'managerId',
      message: "Select the employee's manager (optional, leave empty if none):",
      choices: [
        { name: 'None', value: null },
        ...employees[0].map((employee) => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id })),
      ],
    },
  ]);

  await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [
    answer.firstName,
    answer.lastName,
    answer.roleId,
    answer.managerId,
  ]);
  console.log('Employee added successfully!');
  await startApp();
}

// Function to update an employee's role
async function updateEmployeeRole() {
  const employees = await db.query('SELECT id, first_name, last_name FROM employee');
  const roles = await db.query('SELECT * FROM role');
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'employeeId',
      message: 'Select the employee to update:',
      choices: employees[0].map((employee) => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id })),
    },
    {
      type: 'list',
      name: 'roleId',
      message: 'Select the new role for the employee:',
      choices: roles[0].map((role) => ({ name: role.title, value: role.id })),
    },
  ]);

  await db.query('UPDATE employee SET role_id = ? WHERE id = ?', [answer.roleId, answer.employeeId]);
  console.log('Employee role updated successfully!');
  await startApp();
}

// Start the application
startApp();
