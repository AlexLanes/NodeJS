"use strict"

// Dependencys
import 'dotenv/config'
import existsAuth       from '../../middlewares/authorization/exists.js'
import validAuth        from '../../middlewares/authorization/validate.js'
import {postSafeSchema} from '../../middlewares/schemas.js'
import Aes              from 'crypto-js/aes.js'
import {v4 as uuidv4}   from 'uuid'
import * as Db          from '../../database/postgres.js'
// Globals
const PORT     = process.env.PORT
const RESOURCE = process.env.SAFE_RESOURCE
const AES_SALT = process.env.AES_SALT

export function configure(app) {
    app.post(RESOURCE, existsAuth, validAuth, postSafeSchema, postSafe)
}

async function postSafe(request, response) {
// Preparation
    let user_id     = request.locals.token.id // Get from locals 'validAuth'
    let safe_id     = uuidv4()
    let description = request.body.description
    let username    = request.body.username
    let password    = Aes.encrypt(request.body.password, AES_SALT).toString()
// Create safe
    try {
        await Db.createSafe(user_id, safe_id, description, username, password)
        return response.status(200).json({
            message: 'Safe successfully created',
            next: `GET ${request.protocol}://${request.hostname}:${PORT}${RESOURCE}/${safe_id}`
        })

    } catch(e) {
        console.error(`----- postSafe resulted in error: ${e} -----`)
        return response.status(500).json({ message: 'Internal server error' })  
    }
}