import Express from "express"
import { UserSchema } from "../schemas/users.js"
import { validate as Validate } from "jsonschema"
import { Connection } from "../database/connection.js"
import * as Operations from "../database/operations.js"

const 
    Router = Express.Router(),
    DB = await Connection.getDatabase("sample_mflix"),
    COLLECTION = DB.collection("users")

/**
 * Users routing paths
 */
Router.options("/users", async (req, res) => {
    res.send([
        {
            "method": "GET",
            "path": "/users",
            "description": "query users data",
            "querys-schema": new UserSchema().fields().pagination().build()
        },
        {
            "method": "POST",
            "path": "/users",
            "description": "create user",
            "body-schema": new UserSchema().fields(true).build()
        },
        {
            "method": "GET",
            "path": "/users/{_id}",
            "description": "get user by id",
            "template-schema": new UserSchema().id().build()
        },
        {
            "method": "PUT",
            "path": "/users/{_id}",
            "description": "update all user data",
            "template-schema": new UserSchema().id().build(),
            "body-schema": new UserSchema().fields(true).build()
        },
        {
            "method": "PATCH",
            "path": "/users/{_id}",
            "description": "update some user data",
            "template-schema": new UserSchema().id().build(),
            "body-schema": new UserSchema().fields().build()
        },
        {
            "method": "DELETE",
            "path": "/users/{_id}",
            "description": "delete user",
            "template-schema": new UserSchema().id().build()
        }
    ])
})

/**
 * Query users
 */
Router.get("/users", async (req, res) => {
    let querys = req.query || {},
        schema = new UserSchema().fields().pagination().build()

    let validation = Validate(querys, schema)
    if(!validation.valid)
        return res.status(400).send(validation.errors)

    let { limit, skip, ...find } = querys,
        result = await Operations.find_simple(COLLECTION, find, skip, limit)
    
    res.send(result)
})

/**
 * POST user
 */
Router.post("/users", async (req, res) => {
    let body = req.body,
        schema = new UserSchema().fields(true).build()

    let validation = Validate(body, schema)
    if(!validation.valid)
        return res.status(400).send(validation.errors)

    try {
        res.status(201).send( await Operations.insert_one(COLLECTION, body) )
    } catch(e) {
        res.status(500).send({ "error": e.message })
    }
})

/**
 * GET user by id
 */
Router.get("/users/:_id", async (req, res) => {
    let schema = new UserSchema().id().build()

    let validation = Validate(req.params, schema)
    if(!validation.valid)
        return res.status(400).send(validation.errors)

    let result = await Operations.find_id(COLLECTION, req.params._id)

    if(result == null)
         res.status(404).send({})
    else res.send(result)
})

/**
 * PUT user
 */
Router.put("/users/:_id", async (req, res) => {
    let schema = new UserSchema().id().fields(true).build(),
        body = { ...req.params, ...req.body }

    let validation = Validate(body, schema)
    if(!validation.valid)
        return res.status(400).send(validation.errors)

    delete body["_id"]
    let result = await Operations.replace_one(COLLECTION, req.params._id, body)

    if( result["matchedCount"] == 0 )
         res.status(404).send({})
    else res.send(result)
})

/**
 * PATCH user
 */
Router.patch("/users/:_id", async (req, res) => {
    let schema = new UserSchema().id().fields().build(),
        body = { ...req.params, ...req.body }

    let validation = Validate(body, schema)
    if(!validation.valid)
        return res.status(400).send(validation.errors)

    delete body["_id"]
    let result = await Operations.update_one(COLLECTION, req.params._id, body)

    if( result["matchedCount"] == 0 )
         res.status(404).send({})
    else res.send(result)
})

/**
 * DELETE user
 */
Router.delete("/users/:_id", async (req, res) => {
    let schema = new UserSchema().id().build()

    let validation = Validate(req.params, schema)
    if(!validation.valid)
        return res.status(400).send(validation.errors)

    let result = await Operations.delete_one(COLLECTION, req.params._id)

    if( result["deletedCount"] == 0 )
         res.status(404).send({})
    else res.status(204).send()
})

export default Router