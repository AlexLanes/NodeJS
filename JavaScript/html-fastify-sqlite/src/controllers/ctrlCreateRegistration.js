const crypto = require("crypto-js");
const seo    = require("../util/seo.json");
const db     = require("../database/sqlite.js");
const regist = require("./ctrlViewRegistration.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/create/registration", module.exports.createRegistration);
  },
  
  createRegistration: async(request, reply) => {
    console.log("exec createRegistration");
    
    // Variables
      let user     = request.body.user;
      let password = request.body.password;
      let result, params;
    
    // Validation
      // Length
        if( password.length <= 3 || user.length <= 3 ){
          console.error("Create registration validation ");
          params = await regist.parameters();
          params.message = { error: "Mínimo de 4 caracteres" };
          return reply.view("/src/pages/registration.hbs", params);
        }
      // Special caracter
        if( user.includes(":") || password.includes(":") ){
          console.error("Create registration validation ");
          params = await regist.parameters();
          params.message = { error: "Caracter especial não permitido" };
          return reply.view("/src/pages/registration.hbs", params);
        }
      // Find if user exists
        result = await db.getUser(user);
        if( result.length != 0 ){
          console.error("Create registration validation");
          params = await regist.parameters();
          params.message = { error: "Usuário já existente" };
          return reply.view("/src/pages/registration.hbs", params);
        }
      
    // Creation
      try {
      // Encrypt password
        password = crypto.AES.encrypt(password, process.env.AES_Salt).toString();
      // Insert user and password in the database
        await db.createUser(user, password);
        
      } catch {
        // Error
          // Parameters
            params = await regist.parameters();  
            params.message = { error: "Erro interno, veja o log para detalhes" };
          // Reply
            console.error(`Create registration internal error`);
            return reply.view("/src/pages/registration.hbs", params);
      }
    
    // Success
      // Parameters
        params = await regist.parameters();
        params.message = { success: "Usuário criado com sucesso" };
      // Reply
        console.log(`User: ${user} successfully created`);
        return reply.view("/src/pages/login.hbs", params);
  }
  
};