const Airtable = require('airtable-node');

function Storage(tableName) {
  this.airtableInstance = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_KEY)
    .table(tableName);
}

Storage.prototype.getAirtableInstance = function () {
  return this.airtableInstance;
};

Storage.getTable = function (name) {
  if (!this._tableInstances) {
    this._tableInstances = {};
  }
  this._tableInstances[name] = this._tableInstances[name] || new Storage(name).getAirtableInstance();
  return this._tableInstances[name];
};

module.exports = Storage;
