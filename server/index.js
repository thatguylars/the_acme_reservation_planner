const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3001;
app.use(require("morgan")("dev"));

const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
} = require("./db");

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.customer_id,
        restaurant_id_id: req.body.restaurant_id,
        date: req.body.date,
        party_count: req.body.party_count,
      }),
    );
  } catch (error) {
    next(error);
  }
});

app.use((error, reg, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("created tables");

  const [Drac, Penny, Rasmond, Dillon, McDs, KFC, TBell] = await Promise.all([
    createCustomer({ name: "Danny" }),
    createCustomer({ name: "Peggy" }),
    createCustomer({ name: "Robin" }),
    createCustomer({ name: "Carl" }),
    createRestaurant({ name: "Rpm seafood" }),
    createRestaurant({ name: "Barcocina" }),
    createRestaurant({ name: "Maria's" }),
  ]);

  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: Drac.id,
      restaurant_id: KFC.id,
      date: "12/25/2024",
      party_count: 4,
    }),
    createReservation({
      customer_id: Drac.id,
      restaurant_id: TBell.id,
      date: "08/24/2024",
      party_count: 2,
    }),
  ]);
  console.log(await fetchReservations());
  await destroyReservation({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log("some curl command to rest");
    console.log(`curl localhost:${port}/api/customers`);
    console.log(`curl localhost:${port}/api/restaurants`);
    console.log(`curl localhost:${port}/api/reservations`);
    console.log(
      `curl -X DELETE localhost:${port}/api/customers/${Drac.id}/vacations/${reservation2.id}`,
    );
  });
};

init();
// GET /api/customers
app.get("/api/customers", async (req, res, next) => {
  try {
    const customers = await fetchCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/restaurants
app.get("/api/restaurants", async (req, res, next) => {
  try {
    const restaurants = await fetchRestaurants();
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/reservations
app.get("/api/reservations", async (req, res, next) => {
  try {
    const reservations = await getReservations();
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/customers/:id/reservations
app.post("/api/customers/:id/reservations", async (req, res, next) => {
  const { id: customerId } = req.params;
  const { restaurant_id, date, party_count, time } = req.body;

  try {
    if (!restaurant_id || !date || !party_count || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newReservation = await createReservation({
      customer_id: customerId,
      restaurant_id,
      date,
      time,
    });
    res.status(201).json(newReservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/customers/:customer_id/reservations/:id
app.delete("/api/customers/:customer_id/reservations/:id", async (req, res) => {
  const { id: reservationId } = req.params;

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
