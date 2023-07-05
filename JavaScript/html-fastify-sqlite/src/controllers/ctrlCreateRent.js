const ctrl = require("./ctrlCookie.js");
const rent = require("./ctrlViewRent.js");
const home = require("./ctrlViewHome.js");
const db   = require("../database/sqlite.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/create/rent", module.exports.createRent);
  },
  
  createRent: async(request, reply) => {
    console.log("exec createRent");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    
    // Variables
      let [user, password] = request.cookies.Authentication.split(":");
      let isbn = request.body.book; 
      let days = request.body.days;
      let name, quantity, author, pages, result, params;
    
    // Validation
      result   = await db.getBook(isbn);
      name     = result[0].name;
      author   = result[0].author;
      pages    = result[0].pages;
      quantity = result[0].quantity;
      // Parameters
        params = await rent.parameters();
      // Admin can't rent books
        if( user == "Admin" ){
          console.error("Create rent validation");
          params.message = { error: "Admin não pode realizar aluguéis" };
          return reply.view("/src/pages/rent.hbs", params);
        }
      // Find if book exists
        if( result.length == 0 ){
          console.error("Create rent validation");
          params.message = { error: "Livro não encontrado" };
          return reply.view("/src/pages/rent.hbs", params);
        }
      // Find duplication of rent
        result = await db.duplicatedRent(user, isbn);
        if( result.length >= 1 ){
          console.error("Create rent validation");
          params.message = { error: "Usuário já fez o aluguel desse livro" };
          return reply.view("/src/pages/rent.hbs", params);
        }
    
    // Creation
      try {
        // ID of user
          result = await db.getUser(user);
          let id_user = result[0].id; 
        // Create rent
          await db.createRent(id_user, isbn, days);      
        // Update book
          await db.updateBook(isbn, name, author, pages, quantity - 1);
        
      } catch {
        // Error
          // Parameters
            params = await rent.parameters();
            params.message = { error: "Erro interno, veja o log para detalhes" };
          // Reply
            console.error(`Create rent internal error`);
            return reply.view("/src/pages/rent.hbs", params);
      }
    
    // Success
      // Parameters
        params = await home.parameters(request);
        params.message = { success: "Livro alugado com sucesso" };
      // Reply
        console.log(`User: ${user} has rent book: ${name}`);
        return reply.view("/src/pages/home.hbs", params);
  }

}