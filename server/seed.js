const { client } = require("./common");

const seed = async () => {
  try {
    await client.connect();

    const SQL = `       
        DROP TABLE IF EXISTS customer CASCADE;
        DROP TABLE IF EXISTS restaurant CASCADE;
        DROP TABLE IF EXISTS reservations CASCADE;
        CREATE TABLE customer(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE restaurant(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE reservations(
            id UUID PRIMARY KEY,
            date DATE NOT NULL,
            customer_id UUID REFERENCES customer(id) NOT NULL,
            restaurant_id UUID REFERENCES restaurant(id) NOT NULL
        );
        
    INSERT INTO customer(name) VALUES('larry');
    INSERT INTO customer(name) VALUES('bob');
    INSERT INTO customer(name) VALUES('jan');
    INSERT INTO customer(name) VALUES('barb');
 
    INSERT INTO restaurant(name) VALUES('Aba');
    INSERT INTO restaurant(name) VALUES('Tre Dita');

    INSERT INTO reservations(customer_id, restaurant_id, date) 
VALUES ((SELECT id from customer where name ='larry'), (SELECT id from restaurant where name ='Aba'), '2024-11-28');
INSERT INTO reservations(customer_id, restaurant_id, date) 
VALUES ((SELECT id from customer where name ='bob'), (SELECT id from restaurant where name ='Aba'), '2024-11-29');
INSERT INTO reservations(customer_id, restaurant_id, date) 
VALUES ((SELECT id from customer where name ='jan'), (SELECT id from restaurant where name ='Tre Dita'), '2024-11-30');
INSERT INTO reservations(customer_id, restaurant_id, date) 
VALUES ((SELECT id from customer where name ='barb'), (SELECT id from restaurant where name ='Tre Dita'), '2024-12-01');
    `;

    await client.query(SQL);
    console.log("We have seeded our db");
    await client.end();
  } catch (error) {
    console.error(error);
  }
};

seed();
