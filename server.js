/* General Stuff */
var mv = require('mv');
var shortid = require('shortid');
const fs = require('fs');
var path = require('path');

/* Database stuff */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var fieldTripSchema = mongoose.Schema({
	formStatus: String,
	dateSubmitted: Date,
	submitters: [ { type: String, requried: true } ],
	grades: [ { type: String, required: true } ],
	group: { type: String, required: true },
	destination: { type: String, required: true },
	itinerary: { type: String, required: true },
	pupils: { type: Number, required: true },
	teachers: { type: Number, required: true },
	chaperones: { type: Number, required: true },
	chaperoneInfo: [ { name: { type: String, required: true },
                           phoneNumber: { type: String, required: true } } ],
	leavingSchool: { type: Date, required: true },
	leavingDestination: { type: Date, required: true },
	returnToSchool: { type: Date, required: true },
	extraVehicle: { type: Boolean, required: true },
	sourceofFunds: { type: String, required: true },
	costs: { type: String, required: true },
	buses: { type: Number, required: true },
	transportedBy: String,
	standards: [ { type: String, required: true } ],
	anticipatoryActivity: { type: String, required: true },
	educationalValue: { type: String, required: true },
	nurseRequired: Boolean,
	nurseAttending: String,
	rosterId: { type: String, required: true },
	directionsId: { type: String, required: true },
	actions: [ String ],
	events: [ { timeStamp: Date, user: String, theEvent: String } ],
	approvals: [ {name: String, approvalStatue: String}]
});
var fieldTrip = mongoose.model('fieldTrip', fieldTripSchema);

/* Web server stuff */
var express = require('express');
var formidable = require('express-formidable');
var app = express();
app.use('/api/upload', formidable({keepExtensions: true}));
app.use('/api/create', formidable());

/* Serve static stuff in the public directory */
app.use(express.static('public'));

/* Handle API requests */

/* Create a new field trip */
app.post('/api/create', function (req, res) {
  console.log(req.fields);
  res.status(200).send("Field trip request created");
/*	var doc = new fieldTrip(req.body);
	doc.formStatus = "PENDING";
	doc.dateSubmitted = Date.now();
	doc.nurseAttending = "";
	doc.actions = [];
	doc.events = [ { timeStamp: Date.now(),
			      user: doc.submitters.join(", "),
			  theEvent: "Field trip request created" } ]; 
	doc.approvals = [];
	doc.save(function(err) {
		if (err) {
			res.status(400).send(err);
		} else {
			res.status(200).send("Field trip request created");
		}
	});*/
});


app.get('/api/view/:id', function (req, res) {
	fieldTrip.findById(req.params.id, function (err, doc) {
		if (err) {
			res.status(404).send(err);
		} else {
			res.status(200).send(doc);
		}
	});
});

/* Handle file uploads */
/* Rosters should be in XLSX format */
/* Directions should be PDF */
app.post('/api/upload', function (req, res) {
  /* TODO: Handle errors better */
  if (req.files.file) {
    const MAXSIZE = 10 * 1024 * 1024;
   var filepath = req.files.file.path;
   var name = req.files.file.name;
   var size = req.files.file.size;
   var extension = path.extname(filepath);

   console.log("FILE UPLOAD - " + name + ', ' + filepath + ', ' + size + ', ' + extension);

   if ((extension != '.pdf') && (extension != '.xlsx')) {
     fs.unlink(filepath, function(err) {});
     res.status(400).send({error: "Invalid file extension"});
   } else if (size > MAXSIZE) {
     fs.unlink(filepath, function(err) {})
     res.status(400).send({error: "File too large"});
   } else {
     var newname = shortid.generate() + extension;
     var newpath = 'public/uploads/' + newname;
     var url = 'uploads/' + newname;
     mv(filepath, newpath, function(err) {}); 
     response = { name: name, url: url };
     res.status(200).send(response);
   }
  }
});

app.delete('/uploads/:file', function (req, res) {
  filepath = 'public/uploads/' + path.basename(req.params.file);
  console.log('FILE DELETE - ' + req.params.file);
  fs.unlink(filepath, function(err) {});
  res.status(200).send({status: "File removed successfully"});
});

/*app.get('/approve/:id/:role', function (req, res) {
}

app.get('/deny/:id/:role', function (req, res) {
}

app.get('/drop/:id/:role', function (req, res) {
}*/

app.listen(3000, function () {
	console.log('Field Trip Form Server running on port 3000...');
});
