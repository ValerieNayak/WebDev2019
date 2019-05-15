DROP PROCEDURE IF EXISTS add_user; 

DELIMITER $$ 

CREATE PROCEDURE add_user(IN id VARCHAR(100))

BEGIN
    IF NOT EXISTS (SELECT 1 FROM shops WHERE tj_id = id) THEN
        INSERT INTO shops(tj_id, cash, food) VALUES (id, 10, 10);
    END IF;
END$$

DELIMITER ; 