"use strict"

// Dependencys
import 'dotenv/config'
import {basic as existsAuth} from '../../middlewares/authorization/exists.js'
import {basic as validAuth}  from '../../middlewares/authorization/validate.js'

const RESOURCE = process.env.USER_RESOURCE

export function configure(app) {
    app.get(RESOURCE, existsAuth, validAuth, getUserName)
}

async function getUserName(request, response) {    
// Get from locals 'validAuth'
    let {user} = request.locals
    return response.status(200).json({ user: user })
}