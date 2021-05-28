const jwt = require("jsonwebtoken");  
const models = require("../models");
const User = models.user; 
const ROLES = models.ROLES;


// ----------------------------------------------------------
//        signup
// --------------------------------------------------------
signup = (req, res, next) => {
  // Username User.findOne
  User.findOne({username: req.body.username}).exec((err, user) => {
    if (err) { res.status(500).send({ message: err }); return; }
    if (user) { 
      res.cookie('Content-Type','نام کاربری از قبل ثبت شده')
      res.redirect('/register');
      return; 
    }
    // Email User.findOne
    User.findOne({email: req.body.email}).exec((err, user) => {
      if (err) {res.status(500).send({ message: err }); return;}
      if (user) { 
        res.cookie('Content-Type','ایمیل از قبل موجود است')
        res.redirect('/register');
        return;
      }
      // role existed?
      if (!ROLES.includes(req.body.role)) {
        res.cookie('Content-Type',`نقش ${req.body.role} وجود ندارد.`)
        res.redirect('/register');
        return;
      }
      // if 
      next();
    });
    // !Email User.findOne
  });
  // !Username User.findOne
}
  

// ----------------------------------------------------------
//             export
// --------------------------------------------------------
module.exports = {signup}; 
 
