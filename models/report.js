const mongoose = require('mongoose');
const config = require('../config/database');

const reportSchema = mongoose.Schema({
    author_id:{
                type: mongoose.Schema.Types.ObjectId,
                required: true
    },
    author:{
        type: String,
        required: true
    },
    code:{
        type: String,
        required: true
    },
    output:{
        type: String,
        required: true
    },
    isError: {
        type: Boolean,
        required: true
    },
    compiledOn:{
        type: Date,
        required: true
    },
    language:{
        type: String,
        required: true
    }
});

const Report = module.exports = mongoose.model('Report',reportSchema);

module.exports.showReports = function(id, callback){
    const query = {author_id: id};
    Report.find(query,callback).sort({compiledOn: -1}).limit(10);
}

module.exports.addReport = function(report, callback){
    report.save(callback);
}