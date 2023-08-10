const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

// create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '31415', // Replace with your actual password
  database: 'employee_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// function to view all departments
const viewAllDepartments = async () => {
  try {
    const [departments] = await pool.query('SELECT * FROM department');
    console.table(departments);
    await returnToHomeScreen();
  } catch (error) {
    console.error('Error:', error);
    await returnToHomeScreen();
  }
};

// function to view all roles
const viewAllRoles = async () => {
  try {
    const [roles] = await pool.query('SELECT * FROM role');
    console.table(roles);
    await returnToHomeScreen();
  } catch (error) {
    console.error('Error:', error);
    await returnToHomeScreen();
  }
};

// function to view all employees
const viewAllEmployees = async () => {
  try {
    const [employees] = await pool.query(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
    `);
    console.table(employees);
    await returnToHomeScreen();
  } catch (error) {
    console.error('Error:', error);
    await returnToHomeScreen();
  }
};

// function to add a department
const addDepartment = async (departmentName) => {
  try {
    await pool.query('INSERT INTO department (name) VALUES (?)', [departmentName]);
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to add a role
const addRole = async (title, salary, departmentId) => {
  try {
    await pool.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, departmentId]);
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to add an employee
const addEmployee = async (firstName, lastName, roleId, managerId) => {
  try {
    await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [firstName, lastName, roleId, managerId]);
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to update an employee's role
const updateEmployeeRole = async (employeeId, newRoleId) => {
  try {
    await pool.query('UPDATE employee SET role_id = ? WHERE id = ?', [newRoleId, employeeId]);
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to clear all rows from a table
const clearTable = async (tableName) => {
  try {
    await pool.query(`DELETE FROM ${tableName}`);
    console.log(`All rows deleted from the ${tableName} table.`);
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to return to the home screen
const returnToHomeScreen = async () => {
  try {
    const { returnHome } = await inquirer.prompt({
      type: 'confirm',
      name: 'returnHome',
      message: 'Return to the home screen?',
      default: true,
    });

    if (returnHome) {
      await startApp();
    } else {
      console.log('Goodbye!');
      await pool.end();
    }
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
};

// function to start the application
const startApp = async () => {
  try {
    // prompt the user for actions
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

    // call the appropriate function based on user's choice
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
        await addDepartmentPrompt();
        break;
      case 'Add a role':
        await addRolePrompt();
        break;
      case 'Add an employee':
        await addEmployeePrompt();
        break;
      case 'Update an employee role':
        await updateEmployeeRolePrompt();
        break;
      case 'Clear a table':
        await clearTablePrompt();
        break;
      case 'Exit':
        console.log('Goodbye!');
        await pool.end();
        break;
      default:
        console.log('Invalid choice');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to add a department with the option to add more
const addDepartmentPrompt = async () => {
  try {
    const { departmentName, addMore } = await inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the department name:',
      },
      {
        type: 'confirm',
        name: 'addMore',
        message: 'Do you want to add another department?',
        default: false,
      },
    ]);

    await addDepartment(departmentName);

    if (addMore) {
      await addDepartmentPrompt();
    } else {
      await returnToHomeScreen();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to add a role with the option to add more
const addRolePrompt = async () => {
  try {
    const { title, salary, departmentName, createDepartment, addMore } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the role:',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary for the role:',
      },
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the department name for the role:',
      },
      {
        type: 'confirm',
        name: 'createDepartment',
        message: 'The department does not exist. Do you want to create it?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'addMore',
        message: 'Do you want to add another role?',
        default: false,
      },
    ]);

    if (createDepartment) {
      await addDepartment(departmentName);
      console.log('Department added successfully.');
    }

    const [department] = await pool.query('SELECT id FROM department WHERE name = ?', [departmentName]);
    const departmentId = department[0].id;

    await addRole(title, salary, departmentId);

    if (addMore) {
      await addRolePrompt();
    } else {
      await returnToHomeScreen();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to add an employee with the option to add more
const addEmployeePrompt = async () => {
  try {
    const { firstName, lastName, roleId, managerId, addMore } = await inquirer.prompt([
      // ... (rest of the prompts)
    ]);

    await addEmployee(firstName, lastName, roleId, managerId);

    if (addMore) {
      await addEmployeePrompt();
    } else {
      await returnToHomeScreen();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to update an employee's role with the option to update more
const updateEmployeeRolePrompt = async () => {
  try {
    const { employeeId, newRoleId, updateMore } = await inquirer.prompt([
      // ... (rest of the prompts)
    ]);

    await updateEmployeeRole(employeeId, newRoleId);

    if (updateMore) {
      await updateEmployeeRolePrompt();
    } else {
      await returnToHomeScreen();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// function to clear a table
const clearTablePrompt = async () => {
  try {
    const { tableToClear } = await inquirer.prompt({
      type: 'list',
      name: 'tableToClear',
      message: 'Select a table to clear:',
      choices: ['department', 'role', 'employee'],
    });

    await clearTable(tableToClear);
    await returnToHomeScreen();
  } catch (error) {
    console.error('Error:', error);
  }
};

// start the application
startApp();
