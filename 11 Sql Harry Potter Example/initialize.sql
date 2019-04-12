DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS houses;
DROP TABLE IF EXISTS points;

CREATE TABLE users(u_id VARCHAR(100), age INT, house INT, PRIMARY KEY(u_id));
CREATE TABLE houses(h_id INT, name VARCHAR(30), PRIMARY KEY(h_id));
CREATE TABLE points(p_id VARCHAR(100), pts INT);


INSERT INTO houses(h_id, name) VALUES (0, 'slytherin');
INSERT INTO houses(h_id, name) VALUES (1, 'gryffindor');
INSERT INTO houses(h_id, name) VALUES (2, 'hufflepuff');
INSERT INTO houses(h_id, name) VALUES (3, 'ravenclaw');



INSERT INTO users
    SET 
    u_id='harry', 
    house=(SELECT h_id FROM houses WHERE name='gryffindor'); 
    
INSERT INTO users SET u_id='ron', house=(SELECT h_id FROM houses WHERE name='gryffindor'); 
INSERT INTO users SET u_id='hermione', house=(SELECT h_id FROM houses WHERE name='gryffindor'); 

INSERT INTO users SET u_id='luna', house=(SELECT h_id FROM houses WHERE name='ravenclaw');
INSERT INTO users SET u_id='cho', house=(SELECT h_id FROM houses WHERE name='ravenclaw');
INSERT INTO users SET u_id='ollivander', house=(SELECT h_id FROM houses WHERE name='ravenclaw'); 

INSERT INTO users SET u_id='severus', house=(SELECT h_id FROM houses WHERE name='slytherin');
INSERT INTO users SET u_id='draco', house=(SELECT h_id FROM houses WHERE name='slytherin');


INSERT INTO points(p_id, pts) VALUES ('cho', 1);
INSERT INTO points(p_id, pts) VALUES ('ron', 10);
INSERT INTO points(p_id, pts) VALUES ('hermione', 100);
INSERT INTO points(p_id, pts) VALUES ('severus', 1000);
INSERT INTO points(p_id, pts) VALUES ('luna', 10000);

SELECT sum(pts) FROM points 
	JOIN users on points.p_id = users.u_id 
	JOIN houses on users.house = houses.h_id 
	WHERE name='ravenclaw';
	