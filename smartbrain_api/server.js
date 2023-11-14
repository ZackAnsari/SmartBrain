const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const app = express();
const cors = require("cors");
const knex = require('knex');
require('dotenv').config();

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');


const db = knex({
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl:{rejectUnauthorized: false},
      host : process.env.DATABASE_HOST,
      port:5432,
      user : process.env.DATABASE_USER,
      password : process.env.DATABASE_PW,
      database : process.env.DATABASE_DB
    }
  });

  db.select("*").from('users').then(data => {
    console.log(data);
  });


app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
   res.send("success")
})
app.post("/signin",(req, res) => { signin.handleSignin(req, res, db, bcrypt) })

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)})
    
app.put("/image", (req, res) => { image.handleImage(req, res, db)})

app.listen(3000,()=>{
    console.log("app is listening on port 3000")
})