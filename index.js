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
  console.log(); // Insert a line break
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
    console.log(); // Insert a line break
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
      console.log(); // Insert a line break
      main();
  } catch (error) {
      console.error("Error viewing employees by manager:", error);
  }
}

// Function to add an employee
async function addEmployee() {
  try {
      // Fetch roles from the database
     const roles = await getRoles();

     // Fetch managers from the database
    const managers = await getManagers();

    // Prompt user for employee details
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
        type: "list",
        name: "role_id",
        message: "Choose employee's role:",
        choices: roles.map(role => ({ name: role.title, value: role.id })),
      },
      {
        type: "list",
        name: "manager_id",
        message: "Choose employee's manager:",
        choices: managers.map(manager => ({
          name: `${manager.first_name} ${manager.last_name}`,
          value: manager.id
        }))
      }
    ]);

    // Add the employee to the database
    const result = await new Promise((resolve, reject) => {
      db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
      [
        answers.first_name,
        answers.last_name,
        answers.role_id,
        answers.manager_id,
      ], 
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    console.log(
      `Employee ${answers.first_name} ${answers.last_name} added successfully.`
    );
    console.log(); // Insert a line break
    main();
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}


// Function to remove an employee
async function removeEmployee() {
  // Prompt user to select an employee to remove
  try {
    const employees = await getEmployees(); 
    const answer = await inquirer.prompt([
      {
      type: "list",
      name: "employee_id",
      message: "Select employee to remove:",
      choices: employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      }))
    }
  ]);
    // Delete the selected employee from the database
    await new Promise((resolve, reject) => {
    db.query("DELETE FROM employee WHERE id = ?", [answer.employee_id], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

    console.log("Employee removed successfully.");
    console.log(); // Insert a line break
    main();
  } catch (error) {
    console.error("Error removing employee:", error);
  }
}

// Function to update an employee's role
async function updateEmployeeRole() {
  // Prompt user to select an employee and their new role
  try {

    // Fetch list of employees
    const employees = await getEmployees();

    //Fetch list of roles
    const roles = await getRoles();
 
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "employee_id",
        message: "Select employee to update:",
        choices: employees.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
      }))
      },
      {
        type: "list",
        name: "new_role_id",
        message: "Select new role:",
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      }
    ]);


    // Update the employee's role in the database
    const result = await new Promise((resolve, reject) => {
    db.query("UPDATE employee SET role_id = ? WHERE id = ?", [
      answer.new_role_id,
      answer.employee_id,
    ], function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
    console.log("Employee role updated successfully.");
    console.log(); // Insert a line break
    main();
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}

// Function to update an employee's manager
async function updateEmployeeManager() {
  // Prompt user to select an employee and their new manager
  try {

    // Fetch list of employees
    const employees = await getEmployees();

    // Fetch list of managers (excluding the selected employee)
    const managers = await getManagers();

    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "employeeID",
        message: "Select employee to update:",
      choices: employees.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
      }))
      },
      {
        type: "list",
        name: "new_manager_id",
        message: "Select the new manager for the employee:",
        choices: managers.map(manager => ({
          name: `${manager.first_name} ${manager.last_name}`,
          value: manager.id
        }))
      }
    ]);

    // Update the employee's manager in the database
    const result = await new Promise((resolve, reject) => {
    db.query("UPDATE employee SET manager_id = ? WHERE id = ?", [
      answer.new_manager_id,
      answer.employeeID,
    ],function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
    console.log("Employee manager updated successfully.");
    console.log(); // Insert a line break
    main();
  } catch (error) {
    console.error("Error updating employee manager:", error);
  }
}

// Function to view all roles
async function allRoles() {
  // Query database to retrieve all roles
  try {
    const data = await new Promise((resolve, reject) => {
    db.query("SELECT * FROM role", function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

    console.log("All Roles:");
    console.table(data);
    console.log(); // Insert a line break
    main();
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
        validate: function (input) {
          if (input.trim() === "") {
            return "Please enter a role title.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "salary",
        message: "Enter role salary:",
        validate: function (input) {
          if (input.trim() === "") {
            return "Please enter a role salary.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "department_id",
        message: "Enter department ID:"
      },
    ]);

    // Add the role to the database
    const result = await new Promise((resolve, reject) => {
    db.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answers.title, answers.salary, answers.department_id], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
    console.log(`Role ${answers.title} added successfully.`);
    console.log(); // Insert a line break
    main();
  } catch (error) {
    console.error("Error adding role:", error);
  }
}


// Function to remove a role
async function removeRole() {
  // Prompt user to select a role to remove
  try {
    const roles = await getRoles(); 
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "roleID",
        message: "Select the role to remove:",
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      }
    ]);

    // Delete the selected role from the database
    await new Promise((resolve, reject) => {
    db.query("DELETE FROM role WHERE id = ?", [answer.roleID],function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

    console.log("Role removed successfully.");
    console.log(); // Insert a line break
    main();
  } catch (error) {
    console.error("Error removing role:", error);
  }
}

// Function to view all departments
async function allDepartments() {
  // Query database to retrieve all departments
      try {
        const data = await new Promise((resolve, reject) => {
        db.query("SELECT * FROM department", function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    
        console.log("All Departments:");
        console.table(data);
        console.log(); // Insert a line break
        main();
      } catch (error) {
        console.error("Error viewing Departments:", error);
      }
    }

// Function to add a department
async function addDepartment() {
  try {
    // Prompt user for department details
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter department name:",
        validate: function (input) {
          if (input.trim() === "") {
            return "Please enter a department name.";
          }
          return true;
        },
      }
    ]);

    // Add the department to the database
    const result = await new Promise((resolve, reject) => {
      db.query("INSERT INTO department (name) VALUES (?)", [answer.name], function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    console.log(`Department '${answer.name}' added successfully.`);
    console.log(); // Insert a line break
    main();
  } catch (error) {
    console.error("Error adding department:", error);
  }
}

// Function to remove a department
async function removeDepartment() {
  // Prompt user to select a department to remove
  try {
    // Prompt user to select the department to remove
    const departments = await getDepartments(); 
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Select the department to remove:",
        choices: departments.map(department => ({
          name: department.name,
          value: department.id
        }))
      }
    ]);

    // Remove the selected department from the database
    await new Promise((resolve, reject) => {
      db.query("DELETE FROM department WHERE id = ?", [answer.departmentId], function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    console.log("Department removed successfully.");
    console.log(); // Insert a line break
    main();
  } catch (error) {
    console.error("Error removing department:", error);
  }
}

// Function to view total utilized budget by department
async function totalBudget() {
  // Calculate total utilized budget for each department
  try {
    // SQL query to calculate total utilized budget by department
    const sqlQuery = `
      SELECT department.name AS department_name, SUM(role.salary) AS total_budget
      FROM department
      INNER JOIN role ON department.id = role.department_id
      GROUP BY department.name
    `;

    // Execute the SQL query
    const result = await new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

 // Display the total utilized budget for each department
    console.log("Total Utilized Budget by Department:");
    result.forEach(row => {
      console.log(`${row.department_name}: $${row.total_budget}`);
    });

    console.log(); // Insert a line break
    main(); // Return to the main menu
  } catch (error) {
    console.error("Error viewing total utilized budget by department:", error);
  }
}

//Used to retrieve the departments
async function getDepartments() {
  return new Promise((resolve, reject) => {
    db.query("SELECT id, name FROM department", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

//Used to retrieve the roles
async function getRoles() {
  return new Promise((resolve, reject) => {
    db.query("SELECT id, title FROM role", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

//Used to retrieve the employees
async function getEmployees() {
  return new Promise((resolve, reject) => {
    db.query("SELECT id, first_name, last_name FROM employee", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

//Used to retrieve the employees
async function getManagers() {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM employee WHERE manager_id IS NULL", (err, managers) => {
      if (err) {
        reject(err);
      } else {
        resolve(managers);
      }
    });
  });
}


main();
