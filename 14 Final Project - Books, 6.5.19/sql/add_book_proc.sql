DROP PROCEDURE IF EXISTS add_book; 

DELIMITER $$ 

CREATE PROCEDURE add_book(IN my_title VARCHAR(100), IN my_reader VARCHAR(100))

BEGIN
    INSERT INTO books(title, reader) VALUES (my_title, my_reader);
END$$

DELIMITER ; 