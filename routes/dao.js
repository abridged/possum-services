'use strict';
const storage = require('../services/storage');
const isEmpty = require('lodash.isempty');
const get = require('lodash.get');

const {
  USERS_TABLE_NAME,
  PROPOSALS_TABLE_NAME,
} = require('../config');

const proposals = async (req, res) => {
  const { userAddress } = get(req, 'params', {});

  try {
    const ProposalsTable = storage.getTable(PROPOSALS_TABLE_NAME);
    const UsersTable = storage.getTable(USERS_TABLE_NAME);

    let items;
    if (userAddress) {
      const userInfo = await UsersTable.list({
        filterByFormula: `account_address='${userAddress}'`
      });

      if (isEmpty(userInfo.records)) {
        return res.status(404).json({ error: 'User not found' });
      }

      items = await ProposalsTable.list(); // TODO: add metadata here like user's likes
    } else {
      items = await ProposalsTable.list();
    }
    res.json(items);
  } catch (e) {
    res.status(400).json(e);
  }
};

const likeProject = async (req, res) => {
  // TODO: validate input params
  const ethAddress = req.body.ethAddress;
  const grantId = req.body.grantId;
  const numLikes = req.body.numLikes;

  try {
    const GrantLikesTable = storage.getTable('grant_likes');
    const UsersTable = storage.getTable(USERS_TABLE_NAME);

    const userInfo = await ProposalsTable.list({
      filterByFormula: `account_address='${ethAddress}'`
    });



    const items = await ProposalsTable.list({
      filterByFormula: `user_id='aloksstiwari'`
    });


    const status = await GrantLikesTable.create({
      ethAddress,
      grantId,
      numLikes,
    });
    res.json({
      status,
    });
  } catch (e) {
    res.status(400).json({ e });
  }
};

module.exports = {
  proposals,
  likeProject,
};
