"use strict"

// Dependencys
import 'dotenv/config'
import {basic as existsAuth} from '../../middlewares/authorization/exists.js'
import createAuth            from '../../middlewares/authorization/create.js'
// Globals
const PORT = process.env.PORT
const RESOURCE = process.env.USER_RESOURCE

export function configure(app) {
    app.post(RESOURCE, existsAuth, createAuth, postUser)
}

async function postUser(request, response) {
    return response.status(201).json({
        message: 'User successfully created',
        next: `GET ${request.protocol}://${request.hostname}:${PORT}${RESOURCE}`
    })
}