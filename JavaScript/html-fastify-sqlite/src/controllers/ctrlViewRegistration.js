const seo = require("../util/seo.json");

module.exports = {
  
  listen: async(fastify) => {
    fastify.get("/registration", module.exports.viewRegistration);
  },
  
  viewRegistration: async(request, reply) => {
    console.log("exec viewRegistration");
    // Success
      // Parameters
        let params = await module.exports.parameters();
      // Reply
        return reply.view("/src/pages/registration.hbs", params);
  },
  
  parameters: async function(){
    return { 
      seo: seo
    }
  }
  
};