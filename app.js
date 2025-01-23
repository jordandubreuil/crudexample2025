const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const path = require("path")

const app = express();
const port = process.env.port||3000;

//Create public folder as static
app.use(express.static(path.join(__dirname,"public")));

//Set up middleware to parse json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

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
    res.sendFile("index.html");
});

//Read routes
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

//Create routes
app.post("/addperson", async (req, res)=>{
    try{
        const newPerson = new Person(req.body);
        const savePerson = await newPerson.save();
        //res.status(201).json(savePerson);
        res.redirect("/");
        console.log(savePerson);
    }catch(err){
        res.status(501).json({error:"Failed to add new person."});
    }
});

//Update Route
app.put("/updateperson/:id", (req,res)=>{
    //Example of a promise statement for async fucntion
    Person.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    }).then((updatedPerson)=>{
        if(!updatedPerson){
            return res.status().json({error:"Failed to find person."});
        }
        res.json(updatedPerson);
    }).catch((err)=>{
        res.status(400).json({error:"Failed to update the person."});
    });
});

//Delete route
app.delete("/deleteperson/firstname", async (req,res)=>{
    try{
        const personname = req.query;
        const person = await Person.find(personname);

        if(person.length === 0){
            return res.status(404).json({error:"Failed to find the person."});
        }

        const deletedPerson = await Person.findOneAndDelete(personname);
        res.json({message:"Person deleted Successfully"});

    }catch(err){
        console.log(err);
        res.status(404).json({error:"Person not found"});
    }
});

//Starts the server
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});
