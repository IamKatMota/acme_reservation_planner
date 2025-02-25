//this file is our connection to postgres
const pg = require('pg');
const uuid = require('uuid');

const client = new pg.Client('postgres://kat:Kat1234@localhost:5432/acme_dining_db');

const restaurants = [
    "Nobu", 
    "Mastro's", 
    "KiKi's"
]

const customers = [
    "Bob", 
    "Mary", 
    "Ben"
]

const createCustomer = async (customerName)=>{
    const SQL = `
        INSERT INTO customers(id, name) VALUES($1, $2)
        RETURNING *
    `
    const result = await client.query(SQL, [uuid.v4(), customerName]);
    return result.rows[0];

};
const createRestaurant = async (restaurantName)=>{
    const SQL = `
        INSERT INTO restaurants(id, name) VALUES($1, $2)
        RETURNING *
    `
    const result = await client.query(SQL, [uuid.v4(), restaurantName]);
    return result.rows[0];

};
const createReservation = async (customer_id, restaurantName, date, partyCount)=>{
    const SQL = `
        INSERT INTO reservations(id, date, party_count, restaurant_id, customer_id ) 
        VALUES(
            $1, 
            $2, 
            $3, 
            (SELECT id FROM restaurants WHERE name = $4),  --gets restaurant id by name
            $5
        )
    
        RETURNING *
    `
    const result = await client.query(SQL, [
        uuid.v4(), 
        date, 
        partyCount, 
        restaurantName, //finds restaurant id from restaurant name
        customer_id,
    ]);
    return result.rows[0];

};

const fetchCustomers = async () => {
    const SQL = `
        SELECT * FROM customers
    `
    const result = await client.query(SQL);
    return result.rows;
}

const fetchRestaurants = async () => {
    const SQL = `
        SELECT * FROM restaurants
    `
    const result = await client.query(SQL);
    return result.rows;
}
const fetchReservations = async () => {
    const SQL = `
        SELECT * FROM reservations
    `
    const result = await client.query(SQL);
    return result.rows;
}
//deletes reservation only if it belongs to a given customer
const destroyReservations = async (reservation_id, customer_id) => {
    const SQL = `
        DELETE FROM reservations
        WHERE id = $1 AND customer_id = $2
        RETURNING *
    `
    const result = await client.query(SQL, [reservation_id, customer_id]);
    return result.rows[0];
}


const init = async () => {
    await client.connect();
    const SQL =`
        DROP TABLE IF EXISTS reservations;
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS restaurants;

        CREATE TABLE restaurants(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL
        );
        CREATE TABLE customers (
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL

        );
        CREATE TABLE reservations (
            id UUID PRIMARY KEY,
            date DATE NOT NULL,
            party_count INTEGER NOT NULL,
            restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
            customer_id UUID REFERENCES customers(id) NOT NULL
        );

    `
    await client.query(SQL);

    //created an array and for each array we are going to run the createcustomer function then log it
    customers.forEach(async (name)=> {
        await createCustomer(name); 
        console.log("customer created:" + name);
    });
    restaurants.forEach(async (name)=> {
        await createRestaurant(name); 
        console.log("restaurant created:" + name);
    });

    const luca = await createCustomer("Luca");
    await createReservation(luca.id, "Nobu","2025-11-19", 2);

    console.log('db initialized')
}

module.exports={
    init,
    createCustomer,
    createReservation,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations,
    destroyReservations

}