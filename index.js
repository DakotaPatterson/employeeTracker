const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
require('dotenv').config();
const logo = require('asciiart-logo');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    },
    console.log(`Connected to the employees_db database.`)
  );


  const logoConfig = {
    name: 'Employee Manager',
    font: 'Doom',
    lineChars: 10,
    padding: 2,
    margin: 3,
    borderColor: 'grey',
    logoColor: 'bold-green',
    textColor: 'green'
};

// Generate the logo
const generatedLogo = logo(logoConfig).render();

// Display the logo in the console
console.log(generatedLogo);

  async function main() {
    try{
      while (true) {
    const answer = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
          'View All Employees',
          'View All Employees By Department',
          'View All Employees By Manager',
          'Add Employee',
          'Remove Employee',
          'Update Employee Role',
          'Update Employee Manager',
          'View All Roles',
          'Add Role',
          'Remove Role',
          'View All Departments',
          'Add Department',
          'Remove Department',
          'View Total Utilized Budget By Department',
          'Quit'
          ]
    });

     // Based on the user's choice, you can perform different actions here
     switch (answer.choice) {
      case 'View All Employees':
          // Call function to view all employees
          await allEmployees();
          break;
      case 'View All Employees By Department':
          // Call function to view employees by department
          await employeesByDepartment();
          break;
      case 'View All Employees By Manager':
          // Call function to view employees by manager
          await employeesByManager();
          break;
      case 'Add Employee':
          // Call function to add an employee
          await addEmployee();
          break;
      case 'Remove Employee':
          // Call function to remove an employee
          await removeEmployee();
          break;
      case 'Update Employee Role':
          // Call function to update employee role
          await updateEmployeeRole();
          break;
      case 'Update Employee Manager':
          // Call function to update employee manager
          await updateEmployeeManager();
          break;
      case 'View All Roles':
          // Call function to view all roles
          await allRoles();
          break;
      case 'Add Role':
          // Call function to add a role
          await addRole();
          break;
      case 'Remove Role':
          // Call function to remove a role
          await removeRole();
          break;
      case 'View All Departments':
          // Call function to view all departments
          await allDepartments();
          break;
      case 'Add Department':
          // Call function to add a department
          await addDepartment();
          break;
      case 'Remove Department':
          // Call function to remove a department
          await removeDepartment();
          break;
      case 'View Total Utilized Budget By Department':
          // Call function to view total utilized budget by department
          await totalBudget();
          break;
      case 'Quit':
          console.log('Goodbye!');
          await db.end();
          process.exit();
        }
      }
    } catch (error) {
      console.error('Error in main function:', error);
    }
  }
  
// Function to view all employees
async function allEmployees() {
  // Query database to retrieve all employees
  try {
    const [rows, fields] = await db.query("SELECT * FROM employee");
    console.log("All Employees:");
    rows.forEach(row => {
        console.log(`ID: ${row.id}, Name: ${row.first_name} ${row.last_name}, Role ID: ${row.role_id}, Manager ID: ${row.manager_id}`);
      });
} catch (error) {
    console.error("Error viewing employees:", error);
}
}

// Function to view all employees by department
async function employeesByDepartment() {
  // Query database to retrieve employees grouped by department
  try {
    const [rows, fields] = await db.query("SELECT * FROM employee ORDER BY department_id");
    console.log("Employees By Department:");
    let currentDepartment = '';
    rows.forEach(row => {
       // Display the result
        if (row.department_id !== currentDepartment) {
            console.log(`Department ID: ${row.department_id}`);
            currentDepartment = row.department_id;
        }
        console.log(`ID: ${row.id}, Name: ${row.first_name} ${row.last_name}, Role ID: ${row.role_id}, Manager ID: ${row.manager_id}`);
    });
} catch (error) {
    console.error("Error viewing employees by department:", error);
}
}

// Function to view all employees by manager
async function employeesByManager() {
  // Query database to retrieve employees grouped by manager
  try {
    const [rows, fields] = await db.query("SELECT * FROM employee ORDER BY manager_id");
    console.log("Employees By Manager:");
    let currentManager = '';
    rows.forEach(row => {
      // Display the result
        if (row.manager_id !== currentManager) {
            console.log(`Manager ID: ${row.manager_id}`);
            currentManager = row.manager_id;
        }
        console.log(`ID: ${row.id}, Name: ${row.first_name} ${row.last_name}, Role ID: ${row.role_id}, Manager ID: ${row.manager_id}`);
    });
} catch (error) {
    console.error("Error viewing employees by manager:", error);
}
}

// Function to add an employee
async function addEmployee() {
  // Prompt user for employee details
  try {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter employee\'s first name:',
            validate: function(input) {
              if (input.trim() === '') {
                  return 'Please enter a first name.';
              }
              return true;
          }
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter employee\'s last name:',
            validate: function(input) {
              if (input.trim() === '') {
                  return 'Please enter a last name.';
              }
              return true;
          }
        },
        {
            type: 'input',
            name: 'role_id',
            message: 'Enter employee\'s role ID:',
            validate: function(input) {
              if (input.trim() === '') {
                  return 'Please enter a role id.';
              }
              return true;
          }
        },
        {
            type: 'input',
            name: 'manager_id',
            message: 'Enter employee\'s manager ID:',
            validate: function(input) {
              if (input.trim() === '') {
                  return 'Please enter a manager id.';
              }
              return true;
            }
          }
        ]);
        
      // Add the employee to the database
      await db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]);
      
      console.log(`Employee ${answers.first_name} ${answers.last_name} added successfully.`);
    } catch (error) {
        console.error("Error adding employee:", error);
    }
  }

// Function to remove an employee
async function removeEmployee() {
  // Prompt user to select an employee to remove
  try {
    const employees = await db.query("SELECT * FROM employee");
    const choices = employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
    const answer = await inquirer.prompt({
        type: 'list',
        name: 'employee_id',
        message: 'Select employee to remove:',
        choices: choices
    });
     // Delete the selected employee from the database
    await db.query("DELETE FROM employee WHERE id = ?", [answer.employee_id]);
    console.log("Employee removed successfully.");
  } catch (error) {
      console.error("Error removing employee:", error);
  }
}

// Function to update an employee's role
async function updateEmployeeRole() {
  // Prompt user to select an employee and their new role
  try {
    const employees = await db.query("SELECT * FROM employee");
    const choices = employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Select employee to update:',
            choices: choices
        },
        {
            type: 'input',
            name: 'new_role_id',
            message: 'Enter new role ID:',
            validate: async function(input) {
              const [rows, fields] = await db.query("SELECT * FROM role WHERE id = ?", [input]);
              if (rows.length === 0) {
                  return 'Invalid role ID. Please enter a valid role ID.';
              }
              return true;
          }
        }
    ]);
    // Update the employee's role in the database
    await db.query("UPDATE employee SET role_id = ? WHERE id = ?", [answer.new_role_id, answer.employee_id]);
    console.log("Employee role updated successfully.");
} catch (error) {
    console.error("Error updating employee role:", error);
}
}

// Function to update an employee's manager
async function updateEmployeeManager() {
  // Prompt user to select an employee and their new manager
  try {
    const employees = await db.query("SELECT * FROM employee");
    const choices = employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Select employee to update:',
            choices: choices
        },
        {
            type: 'input',
            name: 'new_manager_id',
            message: 'Enter new manager ID:'
        }
    ]);
    // Update the employee's manager in the database
    await db.query("UPDATE employee SET manager_id = ? WHERE id = ?", [answer.new_manager_id, answer.employee_id]);
    console.log("Employee manager updated successfully.");
} catch (error) {
    console.error("Error updating employee manager:", error);
}
}

// Function to view all roles
async function allRoles() {
  // Query database to retrieve all roles
  try {
    const [rows, fields] = await db.query("SELECT * FROM role");
    console.log("All Roles:");
    rows.forEach(row => {
       // Display the result
        console.log(`ID: ${row.id}, Title: ${row.title}, Salary: ${row.salary}, Department ID: ${row.department_id}`);
      });
} catch (error) {
    console.error("Error viewing roles:", error);
}
}

// Function to add a role
async function addRole() {
  // Prompt user for role details
  try {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter role title:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter role salary:'
        },
        {
            type: 'input',
            name: 'department_id',
            message: 'Enter department ID:'
        }
    ]);
    // Add the role to the database
    await db.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answers.title, answers.salary, answers.department_id]);
    console.log(`Role ${answers.title} added successfully.`);
} catch (error) {
    console.error("Error adding role:", error);
}
}

// Function to remove a role
async function removeRole() {
  // Prompt user to select a role to remove
  try {
    const roles = await db.query("SELECT * FROM role");
    const choices = roles.map(role => ({ name: role.title, value: role.id }));
    const answer = await inquirer.prompt({
        type: 'list',
        name: 'role_id',
        message: 'Select role to remove:',
        choices: choices
    });
    // Delete the selected role from the database
    await db.query("DELETE FROM role WHERE id = ?", [answer.role_id]);
    console.log("Role removed successfully.");
} catch (error) {
    console.error("Error removing role:", error);
}
}

// Function to view all departments
async function allDepartments() {
  // Query database to retrieve all departments
  try {
    const [rows, fields] = await db.query("SELECT * FROM department");
    console.log("All Departments:");
    rows.forEach(row => {
      // Display the result
        console.log(`ID: ${row.id}, Name: ${row.name}`);
    });
} catch (error) {
    console.error("Error viewing departments:", error);
}
}

// Function to add a department
async function addDepartment() {
  // Prompt user for department details
  try {
    const answer = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter department name:'
    });
    // Add the department to the database
    await db.query("INSERT INTO department (name) VALUES (?)", [answer.name]);
    console.log(`Department ${answer.name} added successfully.`);
} catch (error) {
    console.error("Error adding department:", error);
}
}

// Function to remove a department
async function removeDepartment() {
  // Prompt user to select a department to remove
  try {
    const departments = await db.query("SELECT * FROM department");
    const choices = departments.map(department => ({ name: department.name, value: department.id }));
    const answer = await inquirer.prompt({
        type: 'list',
        name: 'department_id',
        message: 'Select department to remove:',
        choices: choices
    });
     // Delete the selected department from the database
    await db.query("DELETE FROM department WHERE id = ?", [answer.department_id]);
    console.log("Department removed successfully.");
} catch (error) {
    console.error("Error removing department:", error);
}
}

// Function to view total utilized budget by department
async function totalBudget() {
  // Calculate total utilized budget for each department
  try {
    const [rows, fields] = await db.query("SELECT department.name AS department_name, SUM(role.salary) AS total_budget FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id GROUP BY department.id");
    console.log("Total Utilized Budget By Department:");
      // Display the result
    rows.forEach(row => {
        console.log(`Department: ${row.department_name}, Total Budget: ${row.total_budget}`);
    });
} catch (error) {
    console.error("Error calculating total budget:", error);
}
}

// Call the main function to start the application
main().catch(error => console.error('Error:', error));