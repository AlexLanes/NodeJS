const ctrl = require("./ctrlCookie.js");
const seo  = require("../util/seo.json");
const db   = require("../database/sqlite.js");
const rd   = require('random');

module.exports = {
  
  listen: async(fastify) => {
    fastify.get("/home", module.exports.viewHome);
  },
  
  viewHome: async(request, reply) => {
    console.log("exec viewHome");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    
    // Success
      // Parameters
        let params = await module.exports.parameters(request);
      // Reply
        return reply.view("/src/pages/home.hbs", params);
  },
  
  parameters: async function(request){
    let [user, password] = request.cookies.Authentication.split(":");
    // Admin parameters
      if( user == "Admin" ){
        return { 
          seo:    seo,
          rents:  await db.getUserRents(user),
          admin:  "Admin",
          users:  (await db.getUsers()).filter( function(object){ if(object.user != "Admin"){return true;} } ),
          books0: await db.getBooks0(),
          books:  await db.getBooks(),
        }
    // User parameters
      } else {
        return { 
          seo:   seo,
          rents: await db.getUserRents(user)
        };
      }
  }
  
}