-- CREATE TABLE students(id INT, s_name VARCHAR(100), home VARCHAR(100), PRIMARY KEY(id));
-- INSERT INTO students(id, s_name, home) VALUE (1, 'George', 'VA');
-- INSERT INTO students(id, s_name, home) VALUE (2, 'John', 'MA');
-- INSERT INTO students(id, s_name, home) VALUE (3, 'Thom', 'VA');
-- INSERT INTO students(id, s_name, home) VALUE (4, 'James', 'VA');

DROP TABLE IF EXISTS students;
CREATE TABLE students(name CHAR(30), house INT, PRIMARY KEY(name));
INSERT INTO students(name, house) VALUE('Ron', 0);

DROP TABLE IF EXISTS houses;
CREATE TABLE houses(id INT, h_name CHAR(30), PRIMARY KEY(id));
INSERT INTO houses(id, h_name) VALUE(0, 'Gryffindor');
INSERT INTO houses(id, h_name) VALUE(1, 'Ravenclaw');
INSERT INTO houses(id, h_name) VALUE(2, 'Hufflepuff');
INSERT INTO houses(id, h_name) VALUE(3, 'Slytherin');