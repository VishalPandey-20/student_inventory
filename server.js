const express = require("express");
const app = express()
const jwt = require("jsonwebtoken")
app.use(express.json())
var knex = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : 'pandit',
      database : 'student_inventory'
    }
  });
  knex.schema.hasTable("student").then(function(exists){
      if (!exists){
          return knex.schema.createTable("student",function(t){
              t.increments("id");
              t.string("name");
              t.string("email");
              t.string("password");
              t.string("qualifiction");
              t.string("age");
              t.string("state");
          })
      }
  })
app.get("/hello",(req,res)=>{
    res.send("hello node.js");
    console.log("hello node.js");

})
app.post("/SignUp",(req,res)=>{
    if(req.body.email.includes("@gmail.com")){
        knex.select("email","password").from("student").then((data)=>{
            var emails = data.map(em=>em["email"])
            var pass = data.map(pas=>pas["password"])
            if(emails.includes(req.body.email)&&pass.includes(req.body.password)){
                res.send("You are Already exists!!");
                console.log("You are Already exists!!");
            }else{
                knex("student").insert(req.body).then((data)=>{
                    res.send("SignUp Successful");
                    console.log("SignUp Successful");
                })
            }
        })
    }else{
        res.send("Ivalid Email");
        console.log("Ivalid Email");
    }
})
app.post("/login",(req,res)=>{
    knex("email","password").from("student").then((data)=>{
        // console.log(data);
        var emails = data.map(em=>em["email"])
        // console.log(emails);
        if(emails.includes(req.body.email)){
            knex.select("*").from("student").where({"email":req.body.email}).then((userdata)=>{
                // console.log(userdata);
                if(userdata[0].password==req.body.password){
                    delete userdata[0].password
                    // console.log(userdata);
                    var token = jwt.sign({"data":userdata},"vishal");
                    res.cookie(token);
                    res.send("Login_Successful");
                    console.log("Login_Successful");
                }else{
                    res.send("Worng Password");
                    console.log("Worng Password");
                }
            })
        }
    })
})
app.get("/userinfo",(req,res)=>{
    var token = req.headers.cookie
    // console.log(token);
    if(!token){
        res.send("Login_Please!!");
        console.log("Login_Please!!");
    }else{
        var list = token.split(";").reverse();
        var tokens = list[0].slice(0,-10).trim();
        jwt.verify(tokens,"vishal",(err,verified)=>{
            if(err){
                res.send(err.message);
                console.log(err.message);
            }else{
                res.send(verified);
                console.log(verified);
            }
        })

    }
})
app.post("/update",(req,res)=>{
    var token = req.headers.cookie
    if(!token){
        res.send("Login_Please");
        console.log("Login_Please");
    }else{
        var list = token.split(";").reverse();
        var tokens = list[0].slice(0,-10).trim();
        jwt.verify(tokens,"vishal",(err,verified)=>{
            if(err){
                res.send(err.message);
                console.log(err.message);
            }else{
                console.log(verified);
                if(verified["data"][0].email===req.body.email){
                    knex("student").where({"email":verified["data"][0].email}).update(req.body).then((U_data)=>{
                        res.send("Your data update successfully");
                        console.log("Your data update successfully");
                    })
                }else{
                    res.send("check Your email");
                    console.log("check Your email");
                }

            }
        })
    }
})
app.delete("/del",(req,res)=>{
    var token = req.headers.cookie
    // console.log(token);
    var list = token.split(";").reverse();
    var tokens = list[0].slice(0,-10).trim();
    jwt.verify(tokens,"vishal",(err,verified)=>{
        // console.log(verified);
        if(err){
            res.send(err.message);
            console.log(err.message);
        }else{
            knex.select("*").from("student").where({"email":req.body.email}).then((data)=>{
                console.log(data);
                // delete data[0]
                // res.send("data delete successfully!.");
                // console.log("data delete successfully!.");
            })
            // delete verified["data"][0]
            // // console.log(verified["data"][0]);
            // res.send("data delete successfully!.");
            // console.log("data delete successfully!.");
        }
    })
})
app.listen(3550);