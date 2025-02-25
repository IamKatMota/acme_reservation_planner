const express = require('express');
const app = express();
const db = require('./db');
app.use(express.json());

app.post('/api/customers', async (req, res, next) => {
    const { name } = req.body;

    const result = await db.createCustomer(name);
    res.send(result);
})
app.get('/api/customers', async (req, res, next) => {
    const result = await db.fetchCustomers();
    res.send(result);  
})
app.get('/api/restaurants', async (req, res, next) => {
    const result = await db.fetchRestaurants();
    res.send(result);  
})
app.get('/api/reservations', async (req, res, next) => {
    const result = await db.fetchReservations();
    res.send(result); 
})
app.post('/api/customers/:id/reservations', async (req, res, next) => {
    const {id} = req.params;
    const {restaurant_name, date, party_count} = req.body;
    try {
        const result = await db.createReservation(id, restaurant_name, date, party_count)
        res.status(201).send(result);
    } catch (error) {
        next(error);
    }  
    
})
app.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
    const {customer_id, id} = req.params;
    try {
        const result = await db.destroyReservations(id, customer_id)
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }  
    
})










const init = async () => {
    await db.init();
    app.listen(3000, () => { console.log("listening on port 3000") });
}

init();