"use strict"

// Dependencys
import Ajv from "ajv"
import addFormats from "ajv-formats"
// Globals
const ajv = new Ajv()
addFormats(ajv)

function validationErrorMessage(schema, error) {
    delete error.instancePath
    delete error.schemaPath
    return { 
        message: "Schema validation failed",
        details: error,
        schema: schema
    }
}

export function postSafeSchema(request, response, next) {
// Schema
    let type = {
        type: "string",
        pattern: "^.{1,255}$"
    }
    let schema = {
        type: "object",
        properties: {
            description: type,
            username:    type,
            password:    type
        },
        required: ["description", "username", "password"],
        additionalProperties: false,
    }
// Validation
    let validate = ajv.compile(schema)
    if (!validate(request.body))
        return response.status(400).json(validationErrorMessage(schema, validate.errors[0]))
// Next
    next()
}

export function patchSafeSchema(request, response, next) {
// Schema
    let type = {
        type: "string",
        pattern: "^.{1,255}$"
    }
    let schema = {
        type: "object",
        properties: {
            description: type,
            username:    type,
            password:    type
        },
        additionalProperties: false,
    }
// Validation
    let validate = ajv.compile(schema)
    if (!validate(request.body))
        return response.status(400).json(validationErrorMessage(schema, validate.errors[0]))
// Next
    next()
}