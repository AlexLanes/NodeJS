"use strict"

import Jwt from 'jsonwebtoken'
import * as Db from '../../database/postgres.js'

const TOKEN_SALT = process.env.TOKEN_SALT
const TOKEN_EXP  = parseInt(process.env.TOKEN_EXP)

export default async (request, response, next) => {
// Get from locals './validate.basic()'
    let {id, username, masterpassword} = request.locals.user
    try {
    // Create token
        let payload = { 
            id: id, 
            username: username,
            masterpassword: masterpassword
        }
        let accesstoken = Jwt.sign(payload, TOKEN_SALT, { 
            algorithm: 'HS512', 
            expiresIn: TOKEN_EXP
        })
    // Update user
        await Db.updateUser(id, accesstoken)
        
    } catch(e) {
        console.error(`----- authorization/update.default() resulted in error: ${e} -----`)
        return response.status(500).json({ message: 'Internal server error' })  
    }
    next()
}