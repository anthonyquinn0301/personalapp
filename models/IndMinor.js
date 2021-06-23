
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var indMinorSchema = Schema( {
  ownerId: ObjectId,
  title: String,
  createdAt: Date,
} );

module.exports = mongoose.model( 'IndMinor', indMinorSchema );
