const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const logo = require("asciiart-logo");
const table = require("console.table");

const db = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  console.log(`Connected to the employees_db database.`)
);

const logoConfig = {
  name: "Employee Manager",
  font: "Doom",
  lineChars: 10,
  padding: 2,
  margin: 3,
  borderColor: "grey",
  logoColor: "bold-green",
  textColor: "green",
};

// Generate the logo
const generatedLogo = logo(logoConfig).render();

// Display the logo in the console
console.log(generatedLogo);

function main() {
    inquirer
.prompt([
        {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "View All Employees By Department",
          "View All Employees By Manager",
          "Add Employee",
          "Remove Employee",
          "Update Employee Role",
          "Update Employee Manager",
          "View All Roles",
          "Add Role",
          "Remove Role",
          "View All Departments",
          "Add Department",
          "Remove Department",
          "View Total Utilized Budget By Department",
          "Quit"],
        }, 
      ]).then(answers => {
        console.log(answers.choice);
        // Based on the user's choice, you can perform different actions here
        switch (answers.choice) {
          case "View All Employees":
            // Call function to view all employees
            allEmployees();
            break;
          case "View All Employees By Department":
            // Call function to view employees by department
            employeesByDepartment();
            break;
          case "View All Employees By Manager":
            // Call function to view employees by manager
            employeesByManager();
            break;
          case "Add Employee":
            // Call function to add an employee
            addEmployee();
            break;
          case "Remove Employee":
            // Call function to remove an employee
            removeEmployee();
            break;
          case "Update Employee Role":
            // Call function to update employee role
            updateEmployeeRole();
            break;
          case "Update Employee Manager":
            // Call function to update employee manager
            updateEmployeeManager();
            break;
          case "View All Roles":
            // Call function to view all roles
            allRoles();
            break;
          case "Add Role":
            // Call function to add a role
            addRole();
            break;
          case "Remove Role":
            // Call function to remove a role
            removeRole();
            break;
          case "View All Departments":
            // Call function to view all departments
            allDepartments();
            break;
          case "Add Department":
            // Call function to add a department
            addDepartment();
            break;
          case "Remove Department":
            // Call function to remove a department
            removeDepartment();
            break;
          case "View Total Utilized Budget By Department":
            // Call function to view total utilized budget by department
            totalBudget();
            break;
          case "Quit":
            console.log("Goodbye!");
            db.end();
            process.exit();
        }
      });
}


// Function to view all employees
async function allEmployees() {
  // Query database to retrieve all employees
  try{
  const data = await new Promise((resolve, reject) => {
    db.query("SELECT * FROM employee", function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  console.log("All Employees:");
  console.table(data);
  main(); // Call the main function after printing the data
} catch (error) {
  console.error("Error viewing employees:", error);
}
}

// Function to view all employees by department
async function employeesByDepartment() {
  // Query database to retrieve employees grouped by department
  try {
    const data = await new Promise((resolve, reject) => {
    db.query("SELECT employee.*, role.title AS role_title, department.name AS department_name FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY department.name;", function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

    console.log("Employees By Department:");
    console.table(data);
    main();
  } catch (error) {
    console.error("Error viewing employees by department:", error);
  }
}

// Function to view all employees by manager
async function employeesByManager() {
  try {
      // Query database to retrieve distinct manager IDs and their names
      const managers = await new Promise((resolve, reject) => {
          db.query("SELECT DISTINCT e.manager_id, CONCAT(m.first_name, ' ', m.last_name) AS manager_name FROM employee e LEFT JOIN employee m ON e.manager_id = m.id", function (err, data) {
              if (err) {
                  reject(err);
              } else {
                  // Format data for prompt choices
                  const choices = data.map(row => ({ name: row.manager_name, value: row.manager_id }));
                  console.log("Managers:", choices); // Debug output
                  resolve(choices);
              }
          });
      });

      // Prompt the user to select a manager
      const { managerId } = await inquirer.prompt({
          type: "list",
          name: "managerId",
          message: "Select a manager:",
          choices: managers
      });

      // Query database to retrieve employees under the selected manager
      const employees = await new Promise((resolve, reject) => {
          db.query("SELECT * FROM employee WHERE manager_id = ?", [managerId], function (err, data) {
              if (err) {
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      });

      console.log(`Employees under Manager ${managers.find(manager => manager.value === managerId).name}:`);
      console.table(employees);
      main();
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
        type: "input",
        name: "first_name",
        message: "Enter employee's first name:",
        validate: function (input) {
          if (input.trim() === "") {
            return "Please enter a first name.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "last_name",
        message: "Enter employee's last name:",
        validate: function (input) {
          if (input.trim() === "") {
            return "Please enter a last name.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "role_id",
        message: "Enter employee's role ID:",
        validate: function (input) {
          if (input.trim() === "") {
            return "Please enter a role id.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "manager_id",
        message: "Enter employee's manager ID:",
        validate: function (input) {
          if (input.trim() === "") {
            return "Please enter a manager id.";
          }
          return true;
        },
      },
    ]);

    // Add the employee to the database
    db.query(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
      [
        answers.first_name,
        answers.last_name,
        answers.role_id,
        answers.manager_id,
      ]
    );

    console.log(
      `Employee ${answers.first_name} ${answers.last_name} added successfully.`
    );
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}

// Function to remove an employee
async function removeEmployee() {
  // Prompt user to select an employee to remove
  try {
    const employees = db.query("SELECT * FROM employee");
    const choices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    const answer = inquirer.prompt({
      type: "list",
      name: "employee_id",
      message: "Select employee to remove:",
      choices: choices,
    });
    // Delete the selected employee from the database
    db.query("DELETE FROM employee WHERE id = ?", [answer.employee_id]);
    console.log("Employee removed successfully.");
  } catch (error) {
    console.error("Error removing employee:", error);
  }
}

// Function to update an employee's role
async function updateEmployeeRole() {
  // Prompt user to select an employee and their new role
  try {
    const employees = db.query("SELECT * FROM employee");
    const choices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "employee_id",
        message: "Select employee to update:",
        choices: choices,
      },
      {
        type: "input",
        name: "new_role_id",
        message: "Enter new role ID:",
        validate: async function (input) {
          const [rows, fields] = db.query("SELECT * FROM role WHERE id = ?", [
            input,
          ]);
          if (rows.length === 0) {
            return "Invalid role ID. Please enter a valid role ID.";
          }
          return true;
        },
      },
    ]);
    // Update the employee's role in the database
    db.query("UPDATE employee SET role_id = ? WHERE id = ?", [
      answer.new_role_id,
      answer.employee_id,
    ]);
    console.log("Employee role updated successfully.");
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}

// Function to update an employee's manager
async function updateEmployeeManager() {
  // Prompt user to select an employee and their new manager
  try {
    const employees = db.query("SELECT * FROM employee");
    const choices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "employee_id",
        message: "Select employee to update:",
        choices: choices,
      },
      {
        type: "input",
        name: "new_manager_id",
        message: "Enter new manager ID:",
      },
    ]);
    // Update the employee's manager in the database
    db.query("UPDATE employee SET manager_id = ? WHERE id = ?", [
      answer.new_manager_id,
      answer.employee_id,
    ]);
    console.log("Employee manager updated successfully.");
  } catch (error) {
    console.error("Error updating employee manager:", error);
  }
}

// Function to view all roles
async function allRoles() {
  // Query database to retrieve all roles
  try {
    const [rows, fields] = db.query("SELECT * FROM role");
    console.log("All Roles:");
    rows.forEach((row) => {
      // Display the result
      console.log(
        `ID: ${row.id}, Title: ${row.title}, Salary: ${row.salary}, Department ID: ${row.department_id}`
      );
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
        type: "input",
        name: "title",
        message: "Enter role title:",
      },
      {
        type: "input",
        name: "salary",
        message: "Enter role salary:",
      },
      {
        type: "input",
        name: "department_id",
        message: "Enter department ID:",
      },
    ]);
    // Add the role to the database
    db.query(
      "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
      [answers.title, answers.salary, answers.department_id]
    );
    console.log(`Role ${answers.title} added successfully.`);
  } catch (error) {
    console.error("Error adding role:", error);
  }
}

// Function to remove a role
async function removeRole() {
  // Prompt user to select a role to remove
  try {
    const roles = db.query("SELECT * FROM role");
    const choices = roles.map((role) => ({ name: role.title, value: role.id }));
    const answer = await inquirer.prompt({
      type: "list",
      name: "role_id",
      message: "Select role to remove:",
      choices: choices,
    });
    // Delete the selected role from the database
    db.query("DELETE FROM role WHERE id = ?", [answer.role_id]);
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
    rows.forEach((row) => {
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
      type: "input",
      name: "name",
      message: "Enter department name:",
    });
    // Add the department to the database
    db.query("INSERT INTO department (name) VALUES (?)", [answer.name]);
    console.log(`Department ${answer.name} added successfully.`);
  } catch (error) {
    console.error("Error adding department:", error);
  }
}

// Function to remove a department
async function removeDepartment() {
  // Prompt user to select a department to remove
  try {
    const departments = db.query("SELECT * FROM department");
    const choices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));
    const answer = await inquirer.prompt({
      type: "list",
      name: "department_id",
      message: "Select department to remove:",
      choices: choices,
    });
    // Delete the selected department from the database
    db.query("DELETE FROM department WHERE id = ?", [answer.department_id]);
    console.log("Department removed successfully.");
  } catch (error) {
    console.error("Error removing department:", error);
  }
}

// Function to view total utilized budget by department
async function totalBudget() {
  // Calculate total utilized budget for each department
  try {
    const [rows, fields] = db.query(
      "SELECT department.name AS department_name, SUM(role.salary) AS total_budget FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id GROUP BY department.id"
    );
    console.log("Total Utilized Budget By Department:");
    // Display the result
    rows.forEach((row) => {
      console.log(
        `Department: ${row.department_name}, Total Budget: ${row.total_budget}`
      );
    });
  } catch (error) {
    console.error("Error calculating total budget:", error);
  }
}

main();
