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
    await returnToHomeScreen();
  } catch (error) {
    console.error('Error:', error);
    await returnToHomeScreen();
  }
};

// Function to view all roles
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
    await returnToHomeScreen();
  } catch (error) {
    console.error('Error:', error);
    await returnToHomeScreen();
  }
};

// Function to add a department
const addDepartment = async (departmentName) => {
  try {
    await pool.query('INSERT INTO department (name) VALUES (?)', [departmentName]);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to add a role
const addRole = async (title, salary, departmentId) => {
  try {
    await pool.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, departmentId]);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to add an employee
const addEmployee = async (firstName, lastName, roleId, managerId) => {
  try {
    await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [firstName, lastName, roleId, managerId]);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to update an employee's role
const updateEmployeeRole = async (employeeId, newRoleId) => {
  try {
    await pool.query('UPDATE employee SET role_id = ? WHERE id = ?', [newRoleId, employeeId]);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to return to the home screen
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

// Function to add a department with the option to add more
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

// Function to add a role with the option to add more
const addRolePrompt = async () => {
  try {
    // Fetch the list of existing departments
    const [departments] = await pool.query('SELECT id, name FROM department');

    // Prompt the user for role details
    const { title, salary, departmentId, addMore } = await inquirer.prompt([
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
        type: 'list',
        name: 'departmentId',
        message: 'Select the department for the role:',
        choices: departments.map(department => ({ name: department.name, value: department.id })),
      },
      {
        type: 'confirm',
        name: 'addMore',
        message: 'Do you want to add another role?',
        default: false,
      },
    ]);

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

// Function to add an employee with the option to add more
const addEmployeePrompt = async () => {
  try {
    // Fetch the list of existing roles
    const [roles] = await pool.query('SELECT id, title FROM role');

    // Fetch the list of existing managers
    const [managers] = await pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS managerName FROM employee');

    // Fetch the list of existing departments
    const [departments] = await pool.query('SELECT id, name FROM department');

    // Prompt the user for employee details
    const { firstName, lastName, roleId, isManager, managerId, departmentId, addMore } = await inquirer.prompt([
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
        choices: roles.map(role => ({ name: role.title, value: role.id })),
      },
      {
        type: 'confirm',
        name: 'isManager',
        message: 'Is this employee a manager?',
        default: false,
      },
      {
        type: 'list',
        name: 'managerId',
        message: "Select the employee's manager:",
        choices: managers.map(manager => ({ name: manager.managerName, value: manager.id })),
        when: (answers) => answers.isManager === false, // Show this prompt only if the employee is not a manager
      },
      {
        type: 'list',
        name: 'departmentId',
        message: "Select the employee's department:",
        choices: departments.map(department => ({ name: department.name, value: department.id })),
      },
      {
        type: 'confirm',
        name: 'addMore',
        message: 'Do you want to add another employee?',
        default: false,
      },
    ]);

    // If the employee is a manager, managerId should be null
    const finalManagerId = isManager ? null : managerId;

    await addEmployee(firstName, lastName, roleId, finalManagerId, departmentId);

    if (addMore) {
      await addEmployeePrompt();
    } else {
      await returnToHomeScreen();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to update an employee's role with the option to update more
const updateEmployeeRolePrompt = async () => {
  try {
    // Fetch the list of existing employees
    const [employees] = await pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS employeeName FROM employee');

    // Fetch the list of existing roles
    const [roles] = await pool.query('SELECT id, title FROM role');

    // Prompt the user for employee details
    const { employeeId, newRoleId, updateMore } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select an employee to update:',
        choices: employees.map(employee => ({ name: employee.employeeName, value: employee.id })),
      },
      {
        type: 'list',
        name: 'newRoleId',
        message: "Select the employee's new role:",
        choices: roles.map(role => ({ name: role.title, value: role.id })),
      },
      {
        type: 'confirm',
        name: 'updateMore',
        message: 'Do you want to update another employee?',
        default: false,
      },
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

// Function to clear a table
const clearTable = async (tableName) => {
  try {
    await pool.query(`DELETE FROM ${tableName}`);
    console.log(`All rows deleted from the ${tableName} table.`);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to clear a table with the option to clear more
const clearTablePrompt = async () => {
  try {
    const { tableToClear, clearMore } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tableToClear',
        message: 'Select a table to clear:',
        choices: ['department', 'role', 'employee'],
      },
      {
        type: 'confirm',
        name: 'clearMore',
        message: 'Do you want to clear another table?',
        default: false,
      },
    ]);

    await clearTable(tableToClear);

    if (clearMore) {
      await clearTablePrompt();
    } else {
      await returnToHomeScreen();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Start the application
startApp();
