"use strict"

import Aes from 'crypto-js/aes.js'
import {v4 as uuidv4} from 'uuid'
import Jwt from 'jsonwebtoken'
import * as Db from '../../database/postgres.js'

const AES_SALT   = process.env.AES_SALT
const TOKEN_SALT = process.env.TOKEN_SALT
const TOKEN_EXP  = parseInt(process.env.TOKEN_EXP)
const passwordValidation = (pw) => {
    return  /[a-z]/g.test(pw) && // lowerCase
            /[A-Z]/g.test(pw) && // upperCase
            /[0-9]/g.test(pw) && // number
            /\W|\_/g.test(pw) && // non-alphanumeric
           !/\s|\:/g.test(pw)    // space && : not allowed
}

export default async (request, response, next) => {
// Get from locals './exists.basic()'
    let {username, password} = request.locals
    try {
    // Duplication
        let select = await Db.getUserName(username)
        if(select.count > 0) 
            return response.status(409).json({ message: 'User already exists' })   
    // Length
        if(username.length < 8 || password.length < 8) 
            return response.status(403).json({ message: '8 characters required' })    
    // Username validation
        if(username.includes(':')) 
            return response.status(403).json({ message: "Character not allowed ':'" }) 
    // Password validation
        if(!passwordValidation(password))
            return response.status(403).json({ 
                message: 'Password validation failed',
                required: ['8 characters','lowerCase','upperCase','number','non-alphanumeric'],
                notAllowed: ['space', ':']
            })  
    // Preparation
        password = Aes.encrypt(password, AES_SALT).toString()
        let id = uuidv4()
    // Create token
        let payload = { 
            id: id, 
            username: username,
            masterpassword: password
        }
        let accessToken = Jwt.sign(payload, TOKEN_SALT, { 
            algorithm: 'HS512', 
            expiresIn: TOKEN_EXP 
        })
    // Create user
        await Db.createUser(id, username, password, accessToken)
        
    } catch(e) {
        console.error(`----- authorization/create.default() resulted in error: ${e} -----`)
        return response.status(500).json({ message: 'Internal server error' })  
    }
    next()
}