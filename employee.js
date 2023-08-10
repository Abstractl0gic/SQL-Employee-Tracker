const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '31415', // Replace with your actual password
  database: 'employee_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to view all departments
const viewAllDepartments = async () => {
  try {
    const [departments] = await pool.query('SELECT * FROM department');
    console.table(departments);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to view all roles
const viewAllRoles = async () => {
  try {
    const [roles] = await pool.query('SELECT * FROM role');
    console.table(roles);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to view all employees
const viewAllEmployees = async () => {
  try {
    const [employees] = await pool.query(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
    `);
    console.table(employees);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to add a department
const addDepartment = async (departmentName) => {
  try {
    await pool.query('INSERT INTO department (name) VALUES (?)', [departmentName]);
    console.log('Department added successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to add a role
const addRole = async (title, salary, departmentId) => {
  try {
    await pool.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, departmentId]);
    console.log('Role added successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to add an employee
const addEmployee = async (firstName, lastName, roleId, managerId) => {
  try {
    await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [firstName, lastName, roleId, managerId]);
    console.log('Employee added successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to update an employee's role
const updateEmployeeRole = async (employeeId, newRoleId) => {
  try {
    await pool.query('UPDATE employee SET role_id = ? WHERE id = ?', [newRoleId, employeeId]);
    console.log('Employee role updated successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to clear all rows from a table
const clearTable = async (tableName) => {
  try {
    await pool.query(`DELETE FROM ${tableName}`);
    console.log(`All rows deleted from the ${tableName} table.`);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to start the application
const startApp = async () => {
  try {
    // Prompt the user for actions
    const { action } = await inquirer.prompt({
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
        'Clear a table',
        'Exit',
      ],
    });

    // Call the appropriate function based on user's choice
    switch (action) {
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
        // ... (existing code)
        break;
      case 'Add a role':
        // ... (existing code)
        break;
      case 'Add an employee':
        // ... (existing code)
        break;
      case 'Update an employee role':
        // ... (existing code)
        break;
      case 'Clear a table':
        const { tableToClear } = await inquirer.prompt({
          type: 'list',
          name: 'tableToClear',
          message: 'Select a table to clear:',
          choices: ['department', 'role', 'employee'],
        });
        await clearTable(tableToClear);
        break;
      case 'Exit':
        console.log('Goodbye!');
        break;
      default:
        console.log('Invalid choice');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Release all connections in the pool and close it
    await pool.end();
  }
};

// Start the application
startApp();





