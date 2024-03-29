require("dotenv").config();
const express = require("express");
const app=express();
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { migrations } = require("mongoose-encryption");

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
const pass=process.env.PASS;
const username=process.env.USER;

async function main(){
    try{
        await mongoose.connect("mongodb+srv://"+username+":"+pass+"@cluster0.nfv1kwx.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser: true});
        //await mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser: true});
    } catch(err){
        console.log(err);
    }
}

main();

const userSchema=new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    facebookId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, cb)=>{
    process.nextTick(()=>{
        return cb(null, {
            id: user.id,
            username: user.username
        });
    });
});
  
passport.deserializeUser((user, cb)=>{
    process.nextTick(()=>{
        return cb(null, user);
    });
});

// Google Login Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// Facebook Login Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",(req,res)=>{
    res.render("home");
});

// Google Authentication
app.get("/auth/google",
    passport.authenticate("google",{scope: ['profile']})
);

app.get("/auth/google/secrets",
    passport.authenticate( "google", {
        successRedirect: "/secrets",
        failureRedirect: "/login"
}));

// Facebook Authentication
app.get('/auth/facebook',
  passport.authenticate('facebook',{scope:["email"]}));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets');
  });

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",(req,res)=>{
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,(err)=>{
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            });
        }
    });
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    User.register({username:req.body.username},req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            });
        }
    });
});

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        async function findMain(){
            try{
                const foundUsers=await User.find({secret:{$ne:null}});
                if(foundUsers!=null){
                    res.render("secrets",{usersWithSecrets:foundUsers});
                }
            } catch(err){
                console.log(err);
            }
        }
        findMain();
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        } else {
            res.redirect("/");
        }
    });
});

app.get("/submit",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("submit");
    } else {
        res.redirect("/login");
    }
});

app.post("/submit",(req,res)=>{
    const submittedSecret=req.body.secret;
    console.log(req.user+"submitted a secret");
    User.findById(req.user.id,(err,foundUser)=>{
        if(err){
            console.log(err);
        } else {
            if(foundUser){
                foundUser.secret=submittedSecret;
                foundUser.save(()=>{
                    res.redirect("/secrets");
                });
            }
        }
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server listening on port "+PORT);
});