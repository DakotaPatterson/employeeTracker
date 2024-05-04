INSERT INTO employee (first_name, last_name, roles_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Mike', 'Chan', 1, 1),
       ('Ashley', 'Rodriguez', 2, null),
       ('Kevin', 'Tupik', 2, 3),
       ('Kunal', 'Singh', 3, null),
       ('Malia', 'Brown', 3, 5),
       ('Sarah', 'Lourd', 4, null),
       ('Tom', 'Allen', 4, 7);
       

INSERT INTO role (title, salary, departments_id)
VALUES ('Sales Lead', 100000, 1),
       ('Salesperson', 80000, 1),
       ('Lead Engineer', 150000, 2),
       ('Software  Engineer', 120000, 2),
       ('Account Manager', 160000, 3),
       ('Accountant', 125000, 3),
       ('Legal Team Lead', 250000, 4),
       ('Lawyer', 190000, 4);


INSERT INTO department (name)
VALUES ('Sales'),
       ('Engineering'),
       ('Finance'),
       ('Legal');