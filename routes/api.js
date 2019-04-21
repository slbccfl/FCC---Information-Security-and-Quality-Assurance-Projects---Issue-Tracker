/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DATABASE; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var searchQuery = req.query;
      // if (searchQuery._id) { searchQuery._id = new ObjectId(searchQuery._id)}
    // following tests for whether searchQuery.open is set to the literal 'true' and sets the parameter to a logical true or false accordingly.
      if (searchQuery.open) { searchQuery.open = String(searchQuery.open) == "true" }  
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var collection = db.collection(project);
        collection.find(searchQuery).toArray(function(err,docs){res.json(docs)});
      });
      
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || ''
      };
      if(!issue.issue_title || !issue.issue_text || !issue.created_by) {
        res.send('missing inputs');
      } else {
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          var collection = db.collection(project);
          collection.insertOne(issue,function(err,doc){
            issue._id = doc.insertedId;
            res.json(issue);
          });
        });
      }
      
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var issueID = req.body._id;
      if (Object.keys(req.body).length === 0) {
        res.send('no updated field sent');
      } else {
        var issue = {
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          updated_on: new Date(),
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          open: req.body.open = String(req.body.open) == "true",
          status_text: req.body.status_text || ''
        };
        // console.log('issue to put: ' + issue.stringify()); 
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          var collection = db.collection(project);
          collection.findAndModify({_id:new ObjectId(issueID)},[['_id',1]],{$set: issue},{new: true},function(err,doc){
            if (!err) {
              res.send('successfully updated') 
            } else {
              res.send('could not update '+issue+' '+err)
            };
          });
        });   
        
      }
      
    })
    
    .delete(function (req, res){
      if (!req.body._id) {
        res.send('_id error');
      } else {
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          var collection = db.collection(req.params.project);
          collection.findAndRemove({_id:new ObjectId(req.body._id)},function(err,doc){
            (!err) ? res.send('deleted ' + req.body._id) : res.send('could not delete ' + req.body._id + ' ' + err);
          });
        });
      }
    });
    
};
