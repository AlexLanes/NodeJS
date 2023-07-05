const crypto = require("crypto-js");
const ctrl   = require("./ctrlCookie.js");
const home   = require("./ctrlViewHome.js");
const db     = require("../database/sqlite.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/update/password", module.exports.updatePassword);
  },
  
  updatePassword: async(request, reply) => {
    console.log("exec updatePassword");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    
    // Variables
      let [user, password] = request.cookies.Authentication.split(":");
      let body_id   = request.body.id;
      let body_user = request.body.user
      let body_pass = request.body.password;
      let result, params;
      
    // Validation
      // Parameters
        params = await home.parameters(request);
      // is Admin ?
        if( user != "Admin" ){
          console.error("Update password validation");
          params.message = { error: "Apenas Admin pode atualizar senha" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // ID
        if( body_id <= 1 ){
          console.error("Update password validation");
          params.message = { error: "ID deve ser maior que 1" };
          return reply.view("/src/pages/home.hbs", params);
        } 
      // User/Password length
        if( body_user.length <= 3 || body_pass.length <= 3 ){
          console.error("Update password validation");
          params.message = { error: "Pelo menos 4 caracteres necessário" };
          return reply.view("/src/pages/home.hbs", params);
        } 
      // Find if user exists
        result = await db.getUser(body_user);
        if( result.length == 0 || result[0].id != body_id ){
          console.error("Update password validation");
          params.message = { error: "Usuário inexistente" };
          return reply.view("/src/pages/home.hbs", params);
        }
    
    // Update
      try {
        body_pass = crypto.AES.encrypt(body_pass, process.env.AES_Salt).toString();
        await db.updatePassword(body_id, body_user, body_pass);
        
      } catch {
        // Error
          // Parameters
            params.message = { error: "Erro interno, veja o log para detalhes" };
          // Reply
            console.error(`Update book internal error`);
            return reply.view("/src/pages/home.hbs", params);
      }
    
    // Success
      // Parameters
        params = await home.parameters(request);
        params.message = { success: "Senha alterada com sucesso" };
      // Reply
        console.log(`Password from user: ${body_user} successfully updated`);
        return reply.view("/src/pages/home.hbs", params);
  }

}