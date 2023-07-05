const crypto = require("crypto-js");
const login  = require("./ctrlViewLogin.js");
const db     = require("../database/sqlite.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.head("/validate/cookie", module.exports.validateCookie);
  },
  
  validateCookie: async(request, reply) => {
    console.log("exec validateCookie");
    // Cookie to authenticate
      let Authentication = request.cookies.Authentication;
      let params;
    
    // Cookie don't exists
      if( Authentication == null || Authentication == undefined || Authentication == "" ) {
        console.error("User not Authenticated");
        params = login.parameters();
        params.message = { error: "Usuário deve se autenticar" };
        return reply.view("/src/pages/login.hbs", params);
      }
    
    // Cookie not valid
      let [user, password] = Authentication.split(":");
      let result = await db.getUser(user);
      if( result.length == 0 || crypto.AES.decrypt(result[0].password, process.env.AES_Salt).toString(crypto.enc.Utf8) 
                                != crypto.AES.decrypt(password, process.env.AES_Salt).toString(crypto.enc.Utf8) 
      ){
        console.error("Cookie validation");
        params = login.parameters();
        params.message = { error: "Usuário deve se autenticar" };
        return reply.view("/src/pages/login.hbs", params);
      }
    
    // Success
      return;
  }
  
};