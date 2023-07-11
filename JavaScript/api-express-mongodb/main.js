import Express from "express"
import { readdir } from "node:fs/promises"

const App = Express()

// JSON strict
App.use( Express.json({strict: true}) )
App.use((req, res, next) => {
    if( req.accepts("application/json") )
        next()
    else 
        res.status(406).end()
})

// Routes injection
for( let route of await readdir("./routes") ){
    let module = await import(`./routes/${route}`)
    if( module.default != undefined )
        App.use( module.default )
}

App.listen(8080, () => console.log("Running on PORT 8080"))