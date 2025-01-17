 const { Client } = require('pg');

const client = new Client({
connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/the_acme_reservation_planner",
});

const createTables = async () => {
  try {
    await client.query(`
      DROP TABLE IF EXISTS customer CASCADE;
      DROP TABLE IF EXISTS restaurant CASCADE;
      DROP TABLE IF EXISTS reservations CASCADE;

      CREATE TABLE customer (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE
      );

      CREATE TABLE restaurant (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE
      );

      CREATE TABLE reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    `);
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error; 
  }
};

const createCustomer = async ({ name }) => {
  try {
    const { rows } = await client.query(
      `
        INSERT INTO customer (name) 
        VALUES ($1) 
        RETURNING *;
      `,
      [name]
    );
    return rows[0]; 
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error; 
  }
};

const createRestaurant = async ({ name }) => {
  try {
    const { rows } = await client.query(
      `
        INSERT INTO restaurant (name) 
        VALUES ($1) 
        RETURNING *;
      `,
      [name]
    );
    return rows[0]; 
  } catch (error) {
    console.error("Error creating restaurant:", error);
    throw error; 
  }
};

const fetchCustomers = async () => {
  try {
    const { rows } = await client.query(`SELECT * FROM customer;`);
    return rows;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error; 
  }
};

const fetchRestaurants = async () => {
  try {
    const { rows } = await client.query(`SELECT * FROM restaurant;`);
    return rows;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error; 
  }
};

const createReservation = async ({ date, customer_id, restaurant_id }) => {
  try {
    const { rows } = await client.query(
      `
        INSERT INTO reservations (date, customer_id, restaurant_id) 
        VALUES ($1, $2, $3) 
        RETURNING *;
      `,
      [date, customer_id, restaurant_id]
    );
    return rows[0];
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error; 
  }
};

const destroyReservation = async (id) => {
  try {
    await client.query(
      `
        DELETE FROM reservations 
        WHERE id = $1;
      `,
      [id]
    );
  } catch (error) {
    console.error("Error deleting reservation:", error);
    throw error; 
  }
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
};
