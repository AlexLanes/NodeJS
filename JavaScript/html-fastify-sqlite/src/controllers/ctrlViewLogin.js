const seo = require("../util/seo.json");

module.exports = {
  
  listen: async(fastify) => {
    fastify.get("/login", module.exports.viewLogin);
    fastify.get("/", module.exports.viewLogin);
  },
  
  viewLogin: async(request, reply) => {
    console.log("exec viewLogin");
    // Success
      // Parameters
        let params = await module.exports.parameters();
      // Reply
        return reply.view("/src/pages/login.hbs", params)
                    .clearCookie('Authentication', {
                      domain: `${process.env.PROJECT_DOMAIN}.glitch.me`,
                      path: '/',
                      secure: true,
                      sameSite: 'lax',
                      httpOnly: true
                    });
  },
  
  parameters: async function(){
    return { 
      seo: seo
    }
  }
  
};