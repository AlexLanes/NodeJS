"use strict"

// Dependencys
import express from 'express'   // main express
import 'dotenv/config'          // .env dependency
import path from 'path';        // path module

// Middlewares
import removeHeaders from './middlewares/removeHeaders.js';

const __dirname = path.resolve().replaceAll('\\', '/') // app.js directory

const app = express()   // Create instance of express
app.use(express.json()) // Middleware for parsing json
app.use(removeHeaders)  // Headers to remove from response

// Controllers dependency injection
for(let controller_path of process.env.CONTROLLERS.split(',')) {
  try {
    let directory  = `file://${__dirname}/routes/${controller_path}.js`     // Directory of dependency
    let controller = await import(directory)                                // Import of dependecy
    controller.configure(app)                                               // Configure app resource 
    console.log(`*** Controller injected: ${directory.substring(7)} ***`)   // Log app resource
    
  } catch(e) {
    console.error(`***** Controller ${controller_path} could not be injected. ${e} *****`)
  }
}

// Listen
const PORT = process.env.PORT // Port from .env
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`)
});