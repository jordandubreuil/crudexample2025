const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser")

const app = express();
const port = process.env.port||3000;

//Set up middleware to parse json requests
app.use(bodyParser.json());

//MongoDB connection setup
const mongoURI = "mongodb://localhost:27017/crudapp";
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});

//Setup Mongoose Schema
const peopleSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String
});

const Person = mongoose.model("Person", peopleSchema, "peopledata");
  
//App Routes
app.get("/", (req,res)=>{
    res.send("Server is working.");
});

app.get("/people", async (req, res)=>{
    try{
        const people = await Person.find();
        res.json(people);
        console.log(people);
    }catch(err){
        res.status(500).json({error:"Failed to get people."});
    }
});

app.get("/people/:id", async (req,res)=>{
    try{
        console.log(req.params.id);
        const person = await Person.findById(req.params.id);
        if(!person){
            return res.status(404).json({error:"{Person not found}"});
        }
        res.json(person);

    }catch(err){
        res.status(500).json({error:"Failed to get person."});
    }
});

//Starts the server
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});
