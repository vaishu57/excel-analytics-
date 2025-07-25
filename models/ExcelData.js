const mongoose = require("mongoose");

const excelDataSchema = new mongoose.Schema({}, { strict: false }); // Flexible schema

module.exports = mongoose.model("ExcelData", excelDataSchema);

