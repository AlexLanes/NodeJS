const ctrl = require("./ctrlCookie.js");
const home = require("./ctrlViewHome.js");
const db   = require("../database/sqlite.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/delete/book", module.exports.deleteBook);
  },
  
  deleteBook: async(request, reply) => {
    console.log("exec deleteBook");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    
    // Variables
      let [user, password] = request.cookies.Authentication.split(":");
      let isbn = request.body.isbn;
      let name = request.body.name;
      let result, params;
    
    // Validation
      // Parameters
        params = await home.parameters(request);
      // is Admin ?
        if( user != "Admin" ){
          console.error("Delete book validation");
          params.message = { error: "Apenas Admin pode apagar livro" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // ISBN length
        if( isbn.length != 10 ){
          console.error("Delete book validation");
          params.message = { error: "ISBN deve possuir 10 caracteres" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // ISBN value
        function validateISBN(isbn){ 
          // Validation
          if( typeof(isbn) != "string" || isbn.length != 10 ){ 
            return false 
          };
          // Create array of numbers and replace X for 10
          isbn = isbn.split("").map( function(char){ 
            return parseInt( char.replace(/X/i, "10") );
          });
          // Sum weigth of numbers
          let sum = 0;
          isbn.forEach( (number, index) => 
            sum += number * (10 - index) 
          );
          return sum % 11 == 0;
        };
        if( !validateISBN(isbn) ){
          console.error("Delete book validation");
          params.message = { error: "ISBN inválido" };
          return reply.view("/src/pages/home.hbs", params);
        } 
      // Name length
        if( name.length < 1 ){
          console.error("Delete book validation");
          params.message = { error: "Nome não pode ser vazio" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Find match for name and isbn
        result = await db.getBook(isbn);
        if( result.length == 0 || result[0].name != name ){
          console.error("Delete book validation");
          params.message = { error: "Livro não encontrado" };
          return reply.view("/src/pages/home.hbs", params);     
        }
    
    // Deletion
      try {
        await db.deleteBook(isbn, name);
        
      } catch {
        // Error
          // Parameters
            params.message = { error: "Erro interno, veja o log para detalhes" };
          // Reply
            console.error(`Delete book internal error`);
            return reply.view("/src/pages/home.hbs", params);
      }
    
    // Success
      // Parameters
        params = await home.parameters(request);
        params.message = { success: "Livro apagado com sucesso" };
      // Reply
        console.log(`Book: ${name} successfully deleted`);
        return reply.view("/src/pages/home.hbs", params);
  }

}