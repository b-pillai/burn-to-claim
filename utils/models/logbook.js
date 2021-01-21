var mongoose = require("mongoose");
var settings = require('../settings.json')
var Schema = mongoose.Schema;

var logbookSchema = new Schema({
  c: Number,
  hasErrors: Boolean,
  settings: Object,
  senderNetwork: String,
  recipientNetwork: String,
  instances: Object,
  txs: Array,
  signedTxs: Array,
  completedTxs: Array,
  completedTxErrors: Array,
  signedTxErrors: Array,
  preBalances: Array,
  postBalances: Array,
  summary: Array,
  cpuData: Array
},{ timestamps: { createdAt: 'created_at' } });
  
  var LogbookModel = mongoose.model("logbook", logbookSchema, settings.dbCollection);
  
  module.exports = LogbookModel;