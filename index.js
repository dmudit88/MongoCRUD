const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/task", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("database connected");
});
const taskSchema = new mongoose.Schema({
  description: String,
  completed: Boolean,
});
const taskModel = new mongoose.model("task", taskSchema);


app.post('/delete',(req,res)=>{
	const success = (val) => {
		res.render('result',{result:val})
	};
	const err = (val) => {
		res.render('result',{result:val});
	};
	const myPromise=new Promise(async(resolve,reject) =>{
		try{
			let doc=await taskModel.findByIdAndDelete(req.body.id);
			resolve('deleted task with description: '+doc.description);
		}catch(err){
			reject("Error while deleting: maybe task with given id not present");
		}
	});
	myPromise.then(success,err);
});
app.get('/delete',(req,res)=>{
	res.render('delete');
});


app.get('/update',(req,res)=>{
	const success = (val) => {
		res.render('result',{result:val})
	};
	const err = (val) => {
		res.render('result',{result:val});
	};
	const myPromise=new Promise(async(resolve,reject)=>{
		try{
			let doc=await taskModel.updateMany({"completed":false},{"completed":true});
			if(doc.n == 0){
				resolve("All tasks were already completed");
			}else{
				console.log(doc);
				resolve("changed status of "+doc.n+" tasks to completed");
			}
		}catch(err){
			reject(err);
		}
	});
	myPromise.then(success,err);
});
app.get('/read',(req,res)=>{
	const success = (val) => {
		console.log(val);
		res.render('read',{res:val});
	};
	const err = (val) => {
		res.render('result',{result:val});
	};
	const myPromise=new Promise(async(resolve,reject)=>{
		try{
			let doc=await taskModel.find({'completed':false});
			if(doc.length == 0){
				reject("All tasks completed");
			}else{
				resolve(doc);
			}

		}catch(err){
			reject(err);
		}
	});
	myPromise.then(success,err);
	
	
});



app.get("/insert", (req, res) => {
  res.render("insert");
});


app.post("/insert", (req, res) => {
  let description = req.body.description;
  let isCompleted = false;
  if (req.body.taskComplete) {
    isCompleted = true;
  }

  const obj = new taskModel({
    description: description,
    completed: isCompleted,
  });
  const success = (val) => {
    res.render('result',{result:val});
  };
  const err = (val) => {
    res.render('result',{result:val});
  };
  const myPromise = new Promise((resolve, reject) => {
    try {
      obj.save();
      resolve("Insertion successful");
    } catch (err) {
      reject("Insertion unsuccessful");
    }
  });
  myPromise.then(success, err);
});
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(5000, (err) => {
  if (err) console.log(err);
  console.log("Server running");
});
