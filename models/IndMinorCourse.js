
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var indMinorCourseSchema = Schema( {
  ownerId: ObjectId,
  minorId: ObjectId,
  course: String,
  createdAt: Date,
} );

module.exports = mongoose.model( 'IndMinorCourse', indMinorCourseSchema );
