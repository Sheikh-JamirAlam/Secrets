require("dotenv").config();
const express = require("express");
const app=express();
const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const saltRounds=bcrypt.genSaltSync(10);

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});
mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser: true});

const userSchema=new mongoose.Schema({
    email: String,
    password: String
});

const User=new mongoose.model("User",userSchema);

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    User.findOne({email:username},(err,foundUser)=>{
        if(err) {
            console.log(err);
        } else {
            if(foundUser) {
                const match=bcrypt.compareSync(password, foundUser.password);
                if(match){
                    res.render("secrets");
                }
            }
        }
    });
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    var hash = bcrypt.hashSync(req.body.password, saltRounds);
    const newUser=new User({
        email: req.body.username,
        password: hash
    });
    newUser.save((err)=>{
        if(err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.listen(3000,()=>{
    console.log("Server started listening.");
});