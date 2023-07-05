const ctrl = require("./ctrlCookie.js");
const home = require("./ctrlViewHome.js");
const db   = require("../database/sqlite.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/delete/rent", module.exports.deleteRent);
  },
  
  deleteRent: async(request, reply) => {
    console.log("exec deleteRent");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    
    // Variables
      let [user, password] = request.cookies.Authentication.split(":");
      let isbn = request.body.isbn;
      let result, id_user, name, quantity, params;
    
    // is Admin ?
      if( user == "Admin" ){
        user = request.body.user;
      }
    
    // Validation
      result = await db.getUserRents(user)
      // Find if user has rents
        if( result.length == 0 ){
          console.error("Delete rent validation");
          params = await home.parameters(request);
          params.message = { error: "Usuário não possui Aluguéis" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Find if user rented this book
        if( !result.map( function(rent){return rent.isbn == isbn;} ).filter(Boolean)[0] ){
          console.error("Delete rent validation");
          params = await home.parameters(request);
          params.message = { error: "Usuário não alugou esse livro" };
          return reply.view("/src/pages/home.hbs", params);
        }
    
    // Deletion
      try {
        // User id
          result  = await db.getUser(user);
          id_user = result[0].id;
        // Delete rent
          await db.deleteRent(id_user, isbn);
        // Update Books
          result = await db.getBook(isbn);
          // Book has not been deleted
          if(result.length != 0){
            name     = result[0].name;
            quantity = result[0].quantity + 1;
            await db.updateBook(isbn, quantity);
          }
        
      } catch {
        // Error
          // Parameters
            params = await home.parameters(request);
            params.message = { error: "Erro interno, veja o log para detalhes" };
          // Reply
            console.error(`Delete rent internal error`);
            return reply.view("/src/pages/home.hbs", params);
      }
    
    // Success
      // Parameters
        params = await home.parameters(request);
        params.message = { success: "Livro devolvido com sucesso" };
      // Reply
        console.log(`User: ${user} returned book: ${name}`);
        return reply.view("/src/pages/home.hbs", params);
  }
  
}