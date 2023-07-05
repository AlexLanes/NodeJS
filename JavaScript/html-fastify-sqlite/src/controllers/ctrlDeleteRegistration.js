const ctrl = require("./ctrlCookie.js");
const home = require("./ctrlViewHome.js");
const db   = require("../database/sqlite.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/delete/registration", module.exports.deleteRegistration);
  },
  
  deleteRegistration: async(request, reply) => {
    console.log("exec deleteRegistration");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    
    // Variables
      let [user, password] = request.cookies.Authentication.split(":");
      let body_id   = request.body.id;
      let body_user = request.body.user;
      let result, params;
    
    // Validation
      // Parameters
        params = await home.parameters(request);
      // is Admin ?
        if( user != "Admin" ){
          console.error("Delete registration validation");
          params.message = { error: "Apenas Admin pode apagar usuários" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // User length
        if( body_user <= 3 ){
          console.error("Delete registration validation");
          params.message = { error: "Usuários possuem o mínimo de 4 caracteres" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // ID
        if( body_id <= 1 ){
          console.error("Delete registration validation");
          params.message = { error: "ID deve ser maior que 1" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Special caracter
        if( body_user.includes(":") ){
          console.error("Delete registration validation ");
          params.message = { error: "Caracter especial não permitido" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Find if user exists
        result = await db.getUser(body_user);
        if( result.length == 0 || result[0].id != body_id ){
          console.error("Delete registration validation");
          params.message = { error: "Usuário inexistente" };
          return reply.view("/src/pages/home.hbs", params);
        }
    
    // Deletion
      try {
        await db.deleteUser(body_id, body_user);
        
      } catch {
        // Error
          // Parameters
            params = await home.parameters(request);
            params.message = { error: "Erro interno, veja o log para detalhes" };
          // Reply
            console.error(`Delete registration internal error`);
            return reply.view("/src/pages/home.hbs", params);
      }
    
    // Success
      // Parameters
        params = await home.parameters(request);
        params.message = { success: "Usuario apagado com sucesso" };
      // Reply
        console.log(`User: ${body_user} has been deleted`);
        return reply.view("/src/pages/home.hbs", params);
  }
  
}