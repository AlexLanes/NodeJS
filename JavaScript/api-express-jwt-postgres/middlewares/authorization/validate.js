"use strict"

import Aes from 'crypto-js/aes.js'
import Utf8 from 'crypto-js/enc-utf8.js'
import Jwt from 'jsonwebtoken'
import * as Db from '../../database/postgres.js'

const AES_SALT      = process.env.AES_SALT
const TOKEN_SALT    = process.env.TOKEN_SALT
const TOKEN_EXP     = parseInt(process.env.TOKEN_EXP)
const PORT          = process.env.PORT
const USER_RESOURCE = process.env.USER_RESOURCE

export async function basic(request, response, next) {
// Get from locals './exists.basic()'
    let {username, password} = request.locals
    try {
        let select = await Db.getUserName(username)
    // User is valid
        if(select.count === 0 || select[0].username !== username || Aes.decrypt(select[0].masterpassword, AES_SALT).toString(Utf8) !== password) 
            return response.status(401).json({ message: "Authorization invalid" })
    // Locals
        request.locals.user = select[0]

    } catch(e){
        console.error(`----- authorization/validate.basic() resulted in error: ${e} -----`)
        return response.status(500).json({ message: 'Internal server error' })  
    }
    next()
}

export default async (request, response, next) => {
// Get from locals './exists.default()'
    let {accesstoken} = request.locals
    try {
    // Validate jwt token
        let token = Jwt.verify(accesstoken, TOKEN_SALT, { ignoreExpiration: true })
        let now = Math.floor(Date.now() / 1000)
    // Expired
        if(now > token.iat + TOKEN_EXP)
            return response.status(403).json({ 
                message: 'Token expired',
                next: `PATCH ${request.protocol}://${request.hostname}:${PORT}${USER_RESOURCE}`
            })
    // Next
        response.header('token-expires-in', token.exp - now) // response header expiration time
        request.locals.token = token // Locals

    } catch(e) {
        console.error(`----- authorization/validate.default() resulted in error: ${e} -----`)
        return response.status(401).json({ message: 'Token validation failed' })  
    }
    next()
}