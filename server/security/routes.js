const mi = require("./middlewares");
const co = require("./controllers");
const Router = require('express').Router(); 

// api
Router.post("/api/auth/signup", [mi.signup], co.signup);
Router.post("/api/auth/signin", co.signin);

// public
Router.get(["/","/home"], co.home);

// notAuth (3)
Router.get('/login', co.login);
Router.get('/register', co.register);

//  dashboard 
Router.get("/dashboard", co.dashboard);
Router.get("/profile", co.profile);
Router.get("/signout", co.signout);


// exports
module.exports = Router;