/**
 * App de Aluguel de livros
 *   O usuário autenticado pode escolher entre os livros disponíveis para alguel
 *   A devolução deve ser concluída pelo usuário em "Minha Área"
**/

// Utilities we need
  const path = require("path");

// Require the fastify framework and instantiate it
  const fastify = require("fastify")({
    logger: false  // Set this to true for detailed logging
  });

// Setup our static files
  fastify.register( require("fastify-static"), {
    root: path.join(__dirname, "public"),
    prefix: "/" // optional: default '/'
  });

// fastify-formbody lets us parse incoming forms
  fastify.register( require("fastify-formbody") );

// Handlebars for Dynamic HTML
  const hbs = require("handlebars")

// point-of-view is a templating manager for fastify
  fastify.register( require("point-of-view"), { 
    engine: {handlebars: hbs} 
  });

// Fastify Cookie Configuration
  fastify.register( require('fastify-cookie'), {
    secret: `${process.env.COOKIE_SECRET}`, // Secret Key
    parseOptions: {}
  });

// Load and parse SEO data
  const seo = require("./src/util/seo.json");
  if (seo.url === "glitch-default") {
    seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
  }

// We use a module for handling database operations in /src
  const data = require("./src/util/data.json");
  const db   = require("./src/database/" + data.database);

// File System Dependency
  const fs = require("fs"); 
 
// .env HANDLEBARS Dependency Injection
  for( let handlebar of process.env.HANDLEBARS.split(",") ){
    let directory = `${__dirname}/src/pages/handlebars/${handlebar}.hbs`;
    hbs.registerPartial( handlebar, fs.readFileSync(directory, 'utf8') );
    console.log(`HANDLEBAR injected:  ${directory}`);
  }

// .env CONTROLLERS Dependency Injection
  for( let ctrl of process.env.CONTROLLERS.split(",") ){
    let directory  = `${__dirname}/src/controllers/${ctrl}.js`;
    let controller = require(directory);
    controller.listen(fastify);
    console.log(`CONTROLLER injected: ${directory}`);
  }

/*
    Run the server and report out to the logs
*/ 
  fastify.listen(process.env.PORT, '0.0.0.0', function(err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${seo.url}`);
  });