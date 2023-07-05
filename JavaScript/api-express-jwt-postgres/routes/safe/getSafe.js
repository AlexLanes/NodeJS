"use strict"

// Dependencys
import 'dotenv/config'
import existsAuth from '../../middlewares/authorization/exists.js'
import validAuth  from '../../middlewares/authorization/validate.js'
import * as Db    from '../../database/postgres.js'
import Aes        from 'crypto-js/aes.js'
import Utf8       from 'crypto-js/enc-utf8.js'
// Globals
const PORT     = process.env.PORT
const RESOURCE = process.env.SAFE_RESOURCE
const AES_SALT = process.env.AES_SALT

export function configure(app) {
    app.get(RESOURCE, existsAuth, validAuth, getUserSafe)
    app.get(`${RESOURCE}/:id`, existsAuth, validAuth, getSafeID)
}

async function getUserSafe(request, response) {
 // Get from locals 'validAuth'    
    let user_id = request.locals.token.id
    try {
        let select  = await Db.getUserSafe(user_id)
        select.forEach(object => {
            object.next = `GET ${request.protocol}://${request.hostname}:${PORT}${RESOURCE}/${object.id}`
            delete object.id
        })
        return response.status(200).json(
            select
        )

    } catch(e) {
        console.error(`----- getUserSafe resulted in error: ${e} -----`)
        return response.status(500).json({ message: 'Internal server error' })  
    }
}

async function getSafeID(request, response) {
 // Get from locals 'validAuth'    
    let user_id = request.locals.token.id
// Template params
    let id = request.params.id
    try {
        let select = await Db.getSafeID(id)
    // Safe not found
        if(select.count === 0)
            return response.status(404).json({ 
                message: 'Safe not found'
            })
    // User validation
        select = select[0]
        if(select.fk_user !== user_id)
            return response.status(401).json({ 
                message: "This safe doesn't belong to you"
            })   
    // Success
        delete select.fk_user
        select.password = Aes.decrypt(select.password, AES_SALT).toString(Utf8)
        return response.status(200).json(
            select
        )

    } catch(e) {
        console.error(`----- getSafeID resulted in error: ${e} -----`)
        return response.status(500).json({ message: 'Internal server error' })  
    }
}