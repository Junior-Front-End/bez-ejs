var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs"); 
const models = require("../models"); 
const User = models.user;
const Role = models.role;

// --------------------------------------
//              signup
// --------------------------------------
exports.signup = (req,res) => {

const user = new User({
  username: req.body.username,
  email: req.body.email,
  password: bcrypt.hashSync(req.body.password, 8)
});

user.save((err, user) => {
  if (err) { res.status(500).send({ message: err }); return; }  
  Role.findOne({name: req.body.role}, (err, role) => {
    if (err) { res.status(500).send({ message: err }); return; }
    user.role = role._id 
    user.save(err => { 
      if (err) { res.status(500).send({ message: err }); return; } 
      // token
      var token = jwt.sign({id: user.id},process.env.JWT_SECRET,{expiresIn: 1000*60*60*24});
      let options = {
        path:"/", sameSite:true, maxAge:1000*60*60*24, httpOnly: true, 
      } 
      res.cookie('x-access-token',token, options);
      res.redirect('/dashboard'); 
    });// user.save()
  });// Role.findOne
});

}
// --------------------------------------
//              signin
// --------------------------------------
exports.signin = (req, res) => { 
  User.findOne({username: req.body.username}).populate("role", "-__v").exec((err,user) => execution(err, user));
  function execution(err, user){ 
    if (err) {res.status(500).send({ message: err }); return ; }
    if (!user){ 
      res.cookie('Content-Type','نام کاربری اشتباه');
      return res.redirect('/login') ;
    } 
    var passIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passIsValid){
      res.cookie('Content-Type','رمز عبور اشتباه');
      return res.redirect('/login');
    }
    //  token 
    var token = jwt.sign({id: user.id},process.env.JWT_SECRET,{expiresIn: 60*60*24});
    let options = {
       sameSite:true, maxAge:1000*60*60*24, httpOnly: true, 
    } 
    res.cookie('x-access-token',token, options)  
    res.cookie('Content-Type',[user.username,user.email])  
    res.redirect('/profile')
  } // execution
};


// --------------------------------------
//              home
// --------------------------------------   
exports.home = (req,res) => {

  let token = req.cookies["x-access-token"] || false; 
  if (!token){return Views('home');}
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err){return Views('home');}
    Views('homeAuth');
  });

  // Views
  function Views(pageID) {
    return res.render('index',{pageTitle: 'خانه',pageID: pageID});
  }

}
// --------------------------------------
//              dashboard
// --------------------------------------   
exports.dashboard = (req,res) => { 

  let token = req.cookies["x-access-token"] || false;
  if (!token){return res.redirect('/login')}
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err){ return res.redirect('/login');}
    FindUser(decoded.id)
  });
  // FindUser
  function FindUser(userID){ 
    User.findById(userID).exec((err, user) => { if(err){Err(err);return;}
      Role.findById(user.role).exec((err, role) => { if(err){Err(err);return;}  
        switch (role.name) {
          case 'admin': Views('dashboard-admin'); break; 
          case 'moderator': Views('dashboard-mod'); break;  
          case 'user': Views('dashboard-user'); break; 
        }
        // Views
        function Views(pageID) {
          return res.render('index',{pageTitle: 'داشبورد', pageID: pageID});
        } 
        // Err
        function Err(err) { res.status(500).send({ message: err }); }
      }); // Role 
    }); // User
  } // FindUser

}
// --------------------------------------
//              profile
// --------------------------------------   
exports.profile = (req,res) => {
  let token = req.cookies["x-access-token"] || false;
  if (!token){return res.redirect('/login')}
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err){ return res.redirect('/login');}
    User.findById(decoded.id).exec((err, user) => { if(err){Err(err);return;}
      res.render('index',{   
        data: user,
        pageID: 'profile',
        pageTitle: 'profile'
      }) // render 
    }); // User
  }); // jwt
}
// --------------------------------------
//              signout
// --------------------------------------   
exports.signout = (req,res) => { 
  res.cookie('x-access-token', '')
  res.redirect('/login')
}
// --------------------------------------
//              login
// --------------------------------------   
exports.login = (req, res) => {
  let message = req.cookies["Content-Type"] || null;
  res.cookie('Content-Type', '')
  res.render('index',{pageTitle: 'ورود', message: message, pageID: 'login'})
}
// --------------------------------------
//              register
// -------------------------------------- 
exports.register = (req, res) => {
  var m = req.cookies['Content-Type'] || null;
  res.cookie('Content-Type','')
  res.render('index',{pageTitle: 'ثبت نام', message: m, pageID: 'register'})
}