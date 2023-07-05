const ctrl = require("./ctrlCookie.js");
const home = require("./ctrlViewHome.js");
const db   = require("../database/sqlite.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/create/book", module.exports.createBook);
  },
  
  createBook: async(request, reply) => {
    console.log("exec createBook");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    
    // Variables
      let [user, password] = request.cookies.Authentication.split(":");
      let isbn        = request.body.isbn;
      let name        = request.body.name;
      let author      = request.body.author;
      let pages       = request.body.pages;
      let quantity    = request.body.quantity;
      let image       = request.body.image;
      let description = request.body.description;
      let result, params;
    
    // Validation
      // Parameters
        params = await home.parameters(request);
      // is Admin ?
        if( user != "Admin" ){
          console.error("Create book validation");
          params.message = { error: "Apenas Admin pode criar livro" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // ISBN length
        if( isbn.length != 10 ){
          console.error("Create book validation");
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
          console.error("Create book validation");
          params.message = { error: "ISBN inválido" };
          return reply.view("/src/pages/home.hbs", params);
        }      
      // ISBN duplication
        result = await db.getBook(isbn);
        if( result.length != 0 ){
          console.error("Create book validation");
          params.message = { error: "ISBN Duplicado" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Name length
        if( name.length < 1 ){
          console.error("Create book validation");
          params.message = { error: "Nome não pode ser vazio" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Name duplication
        result = await db.getBookName(name);
        if( result.length != 0 ){
          console.error("Create book validation");
          params.message = { error: "Nome duplicado" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Author length
        if( author.length < 1 ){
          console.error("Create book validation");
          params.message = { error: "Autor não pode ser vazio" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Pages
        if( pages < 1 ){
          console.error("Create book validation");
          params.message = { error: "Pagina não pode ser menor que 1" };
          return reply.view("/src/pages/home.hbs", params);
        }
      // Quantity
        if( quantity < 1 ){
          console.error("Create book validation");
          params.message = { error: "Quantidade não pode ser menor que 1" };
          return reply.view("/src/pages/home.hbs", params);
        }
    
    // Creation
      try {
        await db.createBook(isbn, name, author, pages, quantity, image, description);
        
      } catch {
        // Error
          // Parameters
            params.message = { error: "Erro interno, veja o log para detalhes" };
          // Reply
            console.error(`Create book internal error`);
            return reply.view("/src/pages/home.hbs", params);
      }
    
    // Success
      // Parameters
        params = await home.parameters(request);
        params.message = { success: "Livro criado com sucesso" };
      // Reply
        console.log(`Book: ${name} successfully created`);
        return reply.view("/src/pages/home.hbs", params);
  }

}