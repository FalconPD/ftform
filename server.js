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
	emails:              {type: [{type: String, requried: true}],
                        required: true},
	grades:              {type: [{type: String, required: true}],
                        required: true},
  vehicles:            {type: [{type: String, required: true}]},
	chaperoneList:       {type: [{name: {type: String, required: true},
                                phone: {type: String, required: true}}]},
  rosters:             {type: [{name: {type: String, required: true},
                                url: {type: String, required: true}}],
                        required: true},
  directions:          {type: [{name: {type: String, required: true},
                                url: {type: String, required: true}}],
                        required: true},
  building:            {type: String, required: true},
  destination:         {type: String, required: true},
  group:               {type: String, required: true},
  itinerary:           {type: String, required: true},
  pupils:              {type: Number, required: true},
  teachers:            {type: Number, required: true},
  chaperones:          {type: Number, required: true},
  departure:           {type: Date, required: true},
  return:              {type: Date, required: true},
  funds:               {type: String, required: true},
  costs:               {type: String, required: true},
  buses:               {type: Number, required: true},
  transportationNotes: {type: String},
  standards:           {type: String, required: true},
  anticipatory:        {type: String, required: true},
  purpose:             {type: String, required: true},
	status:              {type: String},
	submitted:           {type: Date},
  nurse:               {type: String},
  signatures:          {type: [{role: {type: String, required: true},
                                email: {type: String, required: true},
                                response: {type: String, required: true},
                                timeStamp: {type: Date, required: true},
                                comments: {type: String, required: true}}]},
  keys:                {type: [{role: {type: String},
                                key: {type: String}}]}
});
var fieldTrip = mongoose.model('fieldTrip', fieldTripSchema);

/* Web server stuff */
var express = require('express');
var formidable = require('express-formidable');
var app = express();
app.use('/api/upload', formidable({keepExtensions: true}));
app.use('/api/create', formidable());
app.use('/api/sign', formidable());

/* Serve static stuff in the public directory */
app.use(express.static('public'));

/* Handle API requests */

/* Create a new field trip */
app.post('/api/create', function (req, res) {

  var doc = new fieldTrip(req.fields);

  doc.status = 'Pending Signatures';
  doc.nurse = 'Unknown';
  doc.submitted = Date.now();

  doc.keys = [{role: 'NURSE', key: shortid.generate()},
              {role: 'PRINICPAL', key: shortid.generate()},
              {role: 'SUPERVISOR', key: shortid.generate()},
              {role: 'ASSISTANT SUPERINTENDANT', key: shortid.generate()},
              {role: 'TRANSPORTATION', key: shortid.generate()},
              {role: 'PUPIL PERSONELL SERVICES', key: shortid.generate()},
              {role: 'BUILDINGS AND GROUNDS', key: shortid.generate()},
              {role: 'SYSADMIN', key: shortid.generate()}];

	doc.save(function(err) {
		if (err) {
			res.status(400).send(err);
		} else {
			res.status(201).send(doc.id);
		}
	});
});

app.post('/api/sign/:id', function (req, res) {
  signature = req.fields;
  signature.timeStamp = Date.now();
  fieldTrip.findById(req.params.id, function(err, doc) {
    if (err) {
      res.status(404).send(err);
    } else {
      key = doc.keys.find(function (element) {
        return element.role === signature.role;
      });
      if (! key) 
        res.status(500).send('Unable to key for role');
      else {
        if (key.key === signature.key) {
          doc.signatures.push(signature);
          doc.save(function(err) {
            if (err)
              res.status(400).send(err);
            else
              res.status(201).send('Signed Successfully');
          });
        }
        else
          res.status(401).send('Key values do not match for role');
      }
    }
  });
});

app.get('/api/view/:id', function (req, res) {
	fieldTrip.findById(req.params.id, function (err, doc) {
		if (err) {
			res.status(404).send(err);
		} else {
      doc.keys = [];
			res.status(200).send(doc);
		}
	});
});

app.get('/api/list', function (req, res) {
  fieldTrip.find('{}', function (err, docs) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(docs);
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

   console.log("FILE UPLOAD - " + name);

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
