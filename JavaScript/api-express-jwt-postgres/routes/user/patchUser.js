"use strict"

// Dependencys
import 'dotenv/config'
import {basic as existsAuth} from '../../middlewares/authorization/exists.js'
import {basic as validAuth}  from '../../middlewares/authorization/validate.js'
import updateToken           from '../../middlewares/authorization/update.js'

const PORT     = process.env.PORT
const RESOURCE = process.env.USER_RESOURCE

export function configure(app) {
    app.patch(RESOURCE, existsAuth, validAuth, updateToken, patchUser)
}

async function patchUser(request, response) {
    return response.status(200).json({
        message: 'Token successfully updated' ,
        next: `GET ${request.protocol}://${request.hostname}:${PORT}${RESOURCE}`
    })
}