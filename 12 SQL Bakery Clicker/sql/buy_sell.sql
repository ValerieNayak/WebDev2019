DROP PROCEDURE IF EXISTS buy_sell_item; 

DELIMITER $$ 

CREATE PROCEDURE buy_sell_item(IN id VARCHAR(100), IN my_option INT)

BEGIN
    IF my_option = 0 THEN
        UPDATE shops
        SET cash = cash + 2, food = food - 1
        WHERE tj_id = id;
    END IF;
    IF my_option = 1 THEN
        UPDATE shops
        SET cash = cash - 10, food = food + 10 
        WHERE tj_id = id;
    END IF;
END$$

DELIMITER ; 