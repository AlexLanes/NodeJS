"use strict"

// Dependencys
import 'dotenv/config'
import existsAuth        from '../../middlewares/authorization/exists.js'
import validAuth         from '../../middlewares/authorization/validate.js'
import {patchSafeSchema} from '../../middlewares/schemas.js'
import Aes               from 'crypto-js/aes.js'
import * as Db           from '../../database/postgres.js'
// Globals
const RESOURCE = process.env.SAFE_RESOURCE
const AES_SALT = process.env.AES_SALT

export function configure(app) {
    app.patch(`${RESOURCE}/:id`, existsAuth, validAuth, patchSafeSchema, patchSafe)
}

async function patchSafe(request, response) {
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
        let {description, username, password} = request.body
        description !== undefined  ? {} : description = select.description
        username    !== undefined  ? {} : username    = select.username
        password    !== undefined 
            ? password = Aes.encrypt(password, AES_SALT).toString() 
            : password = select.password
        
        await Db.patchSafe(id, description, username, password)
        return response.status(200).json({ 
            message: 'Safe successfully updated' 
        })  

    } catch(e) {
        console.error(`----- patchSafe resulted in error: ${e} -----`)
        return response.status(500).json({ message: 'Internal server error' })  
    }
}