"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Db {
    constructor() {
        this.MongoClient = require('mongodb').MongoClient;
        this.urlCreation = "mongodb://localhost:27017/dbMessagerie";
        this.urlConnection = "mongodb://localhost:27017/";
        /*
         this.MongoClient.connect(this.url, function(err, db) {
             if (err) throw err;
             console.log("Connected to database!");
         });
         */
        /*
         this.MongoClient.connect(this.urlConnection, function(err, db) {
             if (err) throw err;
             var dbo = db.db("dbMessagerie");
             dbo.createCollection("users", function(err, res) {
               if (err) throw err;
               console.log("Collection created!");
               db.close();
             });
         });
         */
    }
    addLogin(username) {
        this.MongoClient.connect(this.urlConnection, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("dbMessagerie");
            var myobj = { name: username };
            dbo.collection("users").insertOne(myobj, function (err, res) {
                if (err)
                    throw err;
                console.log("1 document inserted");
                db.close();
            });
        });
        this.getUsers();
    }
    getUsers() {
        this.MongoClient.connect(this.urlConnection, function (err, db) {
            if (err)
                throw err;
            var dbo = db.db("dbMessagerie");
            dbo.collection("users").find({}).toArray(function (err, result) {
                if (err)
                    throw err;
                console.log(result);
                db.close();
            });
        });
    }
}
exports.Db = Db;
