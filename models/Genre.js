
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;


var genreSchema = Schema({
  genre:String,
  userId:ObjectId,
})
module.exports = mongoose.model( 'Genre', genreSchema );
