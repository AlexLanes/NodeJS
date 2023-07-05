"use strict"

import postgres from 'postgres' // npm postgres connector
import 'dotenv/config'          // .env dependency

const DATABASE = process.env.DATABASE.split(',')

const SQL =
    postgres({
        host    : DATABASE[0],  // Postgres ip address[s] or domain name[s]
        port    : DATABASE[1],  // Postgres server port[s]
        database: DATABASE[2],  // Name of database to connect to
        username: DATABASE[3],  // Username of database user
        password: DATABASE[4],  // Password of database user
        onnotice: (notice) => { // Log notice message
            console.log(`### Database notice: ${notice.message} ###`)
        }
    })

try{
    /* await SQL`DROP TABLE users` */
    await SQL`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY UNIQUE,
            username VARCHAR(255) UNIQUE NOT NULL,
            masterpassword VARCHAR(255) NOT NULL,
            accesstoken VARCHAR(512) UNIQUE NOT NULL
        )`
    await SQL`
        CREATE TABLE IF NOT EXISTS safe (
            fk_user VARCHAR(255) NOT NULL,
            id VARCHAR(255) PRIMARY KEY UNIQUE,
            description VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
        )`

} catch(e){
  console.error(`##### Database creation resulted in erro: ${e} #####`)
}

export default SQL