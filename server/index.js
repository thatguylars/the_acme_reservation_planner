const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3000;
app.use(require("morgan")("dev"));

const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
} = require("./db");

const init = async () => {
  try {
    await client.connect();
    console.log("Connected to database");
    await createTables();
    console.log("Tables created successfully.");

    // Test createCustomer
    const customer = await createCustomer({ name: "Jerry" });
    console.log("Created customer:", customer);

    // Test createRestaurant
    const restaurant = await createRestaurant({ name: "miru" });
    console.log("Created restaurant:", restaurant);
  } catch (error) {
    console.error("Error during initialization:", error);
  } finally {
    await client.end();
  }
};

init();

// GET /api/customers
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await fetchCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/restaurants
app.get("/api/restaurants", async (req, res) => {
  try {
    const restaurants = await fetchRestaurants();
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/reservations
app.get("/api/reservations", async (req, res) => {
  try {
    const reservations = await client.query("SELECT * FROM reservations");
    res.json(reservations.rows);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/customers/:id/reservations
app.post("/api/customers/:id/reservations", async (req, res) => {
  const { id: customerId } = req.params;
  const { restaurant_id, date, party_count } = req.body;

  try {
    if (!restaurant_id || !date || !party_count) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newReservation = await createReservation({
      customer_id: customerId,
      restaurant_id,
      date,
    });
    res.status(201).json(newReservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/customers/:customer_id/reservations/:id
app.delete("/api/customers/:customer_id/reservations/:id", async (req, res) => {
  const { customer_id, id: reservationId } = req.params;

  try {
    await destroyReservation(reservationId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Error handling route
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "An unexpected error occurred" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
