DROP TABLE IF EXISTS books;

CREATE TABLE books(
    book_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(100),
    reader VARCHAR(100),
    PRIMARY KEY(book_id)
);

INSERT INTO books(title, reader)
VALUES ("Harry Potter and the Sorcerer's Stone", '2020vnayak');