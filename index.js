const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");
require("dotenv").config();

//for app use
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("doctors"));
app.use(fileUpload());

//for database and port setup
const port = process.env.PORT || 5000;
const database = process.env.DB_PATH;

// Create a connection with MongoClient
let client = new MongoClient(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// root get request
app.get("/", (req, res) => {
  res.send(
    '<h1 style="color:green;text-align:center">Welcome to Doctor Portal Server....</h1>'
  );
});

//post data into database
client.connect((err) => {
  const appointmentCollection = client
    .db("doctorPortal")
    .collection("appointments");
  const doctorCollection = client.db("doctorPortal").collection("doctors");

  //read appointments
  app.get("/appointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //post appointments
  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
      console.log("Successfully Send Data Into Database");
      // res.redirect("/addProduct");
    });
  });

  //post appointment by date
  app.post("/appointmentByDate", (req, res) => {
    const date = req.body;
    console.log(date.date);
    appointmentCollection
      .find({ date: date.date })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  //add doctors api
  app.post("/addADoctor", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    doctorCollection.insertOne({ name, email, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //read all doctors
  app.get("/doctors", (req, res) => {
    doctorCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.listen(process.env.PORT || port, () => {
  {
    message: console.log("server running on the 5000 port");
  }
});
