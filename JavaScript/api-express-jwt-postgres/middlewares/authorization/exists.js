"use strict"

import {Base64} from 'js-base64'

export async function basic(request, response, next){
// Contains authentication
    let Authorization = request.header('Authorization')
    if( Authorization === null || Authorization === undefined )
        return response.status(401).json({ message: 'No authorization detected' })
// Correct type        
    let [type, auth] = Authorization.split(' ')
    let [username, password] = Base64.decode(auth).split(':')
    request.locals = { username: username, password: password } // Insert authorization value in locals
    switch(type){
        case 'Basic' : return next()
        case 'Bearer': return response.status(403).json({ message: 'Use Basic for authorization' })
        default      : return response.status(403).json({ message: 'Authorization not supported' })  
    }
}

export default async (request, response, next) => {
// Contains authentication
    let Authorization = request.header('Authorization')
    if( Authorization === null || Authorization === undefined )
        return response.status(401).json({ message: 'No authorization detected' })
// Correct type        
    let [type, auth] = Authorization.split(' ')
    request.locals = { accesstoken: auth } // Insert token value in locals
    switch(type){
        case 'Basic' : return response.status(403).json({ message: 'Use Bearer for authorization' })
        case 'Bearer': return next()
        default      : return response.status(403).json({ message: 'Authorization not supported' })  
    }
}