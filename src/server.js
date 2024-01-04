const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

//mongoose.connect('mongodb://localhost:27017/local',
mongoose.connect('mongodb://sga:Porcion17@10.0.66.16:27019/?authSource=bds08',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
