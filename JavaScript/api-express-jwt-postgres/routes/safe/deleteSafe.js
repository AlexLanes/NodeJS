"use strict"

// Dependencys
import 'dotenv/config'
import existsAuth from '../../middlewares/authorization/exists.js'
import validAuth  from '../../middlewares/authorization/validate.js'
import * as Db    from '../../database/postgres.js'
// Globals
const RESOURCE = process.env.SAFE_RESOURCE

export function configure(app) {
    app.delete(`${RESOURCE}/:id`, existsAuth, validAuth, deleteSafe)
}

async function deleteSafe(request, response) {
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
        await Db.deleteSafe(id)
        return response.status(200).json({
            message: 'Safe successfully deleted'
        })

    } catch(e) {
        console.error(`----- deleteSafe resulted in error: ${e} -----`)
        return response.status(500).json({ message: 'Internal server error' })  
    }
}