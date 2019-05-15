DROP TABLE IF EXISTS shops;
DROP TABLE IF EXISTS prices;

CREATE TABLE shops(tj_id VARCHAR(100), cash INT, food INT, PRIMARY KEY(tj_id));
CREATE TABLE prices(item VARCHAR(100), price INT, PRIMARY KEY(item));

INSERT INTO prices(item, price) VALUES ('bake_cookie', -2);
INSERT INTO prices(item, price) VALUES ('sell_cookie', 3);