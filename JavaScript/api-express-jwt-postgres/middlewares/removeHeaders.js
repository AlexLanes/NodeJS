"use strict"

export default async (request, response, next) => {
    response.removeHeader("x-powered-by")
    next()
}