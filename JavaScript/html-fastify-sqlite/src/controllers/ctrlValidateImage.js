const ctrl = require("./ctrlCookie.js");
const req  = require('request');

module.exports = {
  
  listen: async(fastify) => {
    fastify.post("/validate/image", module.exports.validateImage);
  },
  
  validateImage: async(request, reply) => {
    console.log("exec validateImage");
    // Validate authentication cookie
      await ctrl.validateCookie(request, reply);
    // is Admin ?
      if( request.cookies.Authentication.split(":")[0] != "Admin" ){
        return { error: "Apenas admin está autorizado a validar imagem" };
      }
    
    let json = JSON.parse(request.body);
    if( json.link == undefined || json.link == null || json.link == "" ){
      return reply.send({ ok: false, link: process.env.IMAGE_UNAVAILABLE });
    }
    
    req(json.link, function (error, response, body) {
                     if( response.statusCode == 200 && body != "" ){
                       return reply.send({ ok: true,  link: json.link });
                     } else {
                       return reply.send({ ok: false, link: process.env.IMAGE_UNAVAILABLE });
                     }
                   }
    );
  }
  
}