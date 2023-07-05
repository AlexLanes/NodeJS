const crypto = require("crypto-js");
const login  = require("./ctrlViewLogin.js");
const books  = require("./ctrlViewBooks.js");
const db     = require("../database/sqlite.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/login", module.exports.validateLogin);
  },
  
  validateLogin: async(request, reply) => {
    console.log("exec validateLogin");
      
    // Variables
      let user     = request.body.user;
      let password = request.body.password;
      let result, params;
      
    // Validation
      // User exists
        result = await db.getUser(user);
        if( result.length == 0 ){
          console.error("Login validation");
          params = login.parameters();
          params.message = { error: "Usuário inexistente" };
          return reply.view("/src/pages/login.hbs", params);
        }
      // Password is correct
        if( crypto.AES.decrypt(result[0].password, process.env.AES_Salt).toString(crypto.enc.Utf8) != password ){
          console.error("Login validation");
          params = login.parameters();
          params.message = { error: "Senha incorreta" };
          return reply.view("/src/pages/login.hbs", params);
        }
    
    // Success
      // Parameters
        params = await books.parameters();
        params.message = { success: "Seja bem-vindo" };
      // Reply
        console.log(`User: ${user} successfully logged in`);
        password = crypto.AES.encrypt(password, process.env.AES_Salt).toString();
        return reply.view("/src/pages/books.hbs", params)
                    .setCookie('Authentication', `${user}:${password}`, {
                      domain: `${process.env.PROJECT_DOMAIN}.glitch.me`,
                      path: '/',
                      maxAge: 60 * 222, // 222 minutes
                      secure: true,
                      sameSite: 'lax',
                      httpOnly: true
                    });
  }
  
};