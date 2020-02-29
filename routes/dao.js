'use strict';
const storage = require('../services/storage');

const proposals = async (req, res) => {
  const ProposalsTable = storage.getTable('user');
  const items = await ProposalsTable.list();
  res.json({
    items,
  });
};

module.exports = {
  proposals,
};
