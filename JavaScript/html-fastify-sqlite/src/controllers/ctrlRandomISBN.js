const rd   = require('random');
const ctrl = require("./ctrlCookie.js");

module.exports = {
  
  listen: async(fastify) => {
    fastify.get("/random/isbn10", module.exports.randomISBN10);
  },
  
  randomISBN10: async(request, reply) => {
    console.log("exec randonISBN10");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    // is Admin ?
      if( request.cookies.Authentication.split(":")[0] != "Admin" ){
        return { error: "Apenas admin está autorizado a gerar ISBN" };
      }
    
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
    
    function getRandom(){
      let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'X'];
      let isbn = [];
      let index;
      while ( isbn.length != 10 ){
        if( isbn.length != 10 ){
          index = rd.int(0, 9);
          isbn.push(values[index]);
        } else {
          index = rd.int(0, 10);
          isbn.push(values[index]);
        }
      }
      return isbn.join("");
    };
    
    var isbn = getRandom();
    while( !validateISBN(isbn) ){
      isbn = getRandom();
    };
    
    return { isbn10: isbn };
  }
  
}