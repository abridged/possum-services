'use strict';
const storage = require('../services/storage');
const isEmpty = require('lodash.isempty');
const get = require('lodash.get');

const {
  USERS_TABLE_NAME,
  GRANTS_TABLE_NAME,
  GRANT_LIKES_TABLE_NAME,
} = require('../config');

const proposals = async (req, res) => {
  const { userAddress } = get(req, 'params', {});

  try {
    const GrantsTable = storage.getTable(GRANTS_TABLE_NAME);
    const GrantLikesTable = storage.getTable(GRANT_LIKES_TABLE_NAME);
    const UsersTable = storage.getTable(USERS_TABLE_NAME);

    let items = await GrantsTable.list();
    items = items.records.map(item => {
      let totalUsersLiked = 0;
      if (item.fields.grant_likes) {
        totalUsersLiked = item.fields.grant_likes.length;
      }
      return {
        ...item.fields,
        totalUsersLiked,
      };
    });

    if (userAddress) {
      // TODO: could be extracted to the middleware
      const userInfoQuery = await UsersTable.list({
        filterByFormula: `account_address='${userAddress}'`
      });

      if (isEmpty(userInfoQuery.records)) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userInfo = get(userInfoQuery, 'records[0]', {});

      const userLikesQuery = await GrantLikesTable.list({
        filterByFormula: `user_id='${userInfo.fields.user_id}'`
      });

      const userLikes = userLikesQuery.records.reduce((memo, like) => {
        return {
          ...memo,
          [like.id]: like.fields.num_likes,
        }
      }, {});
      console.log(userLikes);

      items = items.map(item => {
        let liked = false;
        let numLikes = 0;
        if (item.grant_likes) {
          const grantLikedId = item.grant_likes.find(grantLikesId => userLikes[grantLikesId]);
          if (grantLikedId) {
            liked = true;
            numLikes = userLikes[grantLikedId];
          }
          delete item.grant_likes;
        }
        return {
          ...item,
          liked,
          numLikes,
        };
      });
    }
    res.json(items);
  } catch (e) {
    res.status(400).json(e);
  }
};

const likeProject = async (req, res) => {
  // TODO: validate input params
  const params = get(req, 'body', {});
  const { userAddress } = params;
  const numLikes = parseInt(params.numLikes || 0, 10);
  const grantId = parseInt(params.grantId || 0, 10);

  try {
    const GrantsTable = storage.getTable(GRANTS_TABLE_NAME);
    const GrantLikesTable = storage.getTable(GRANT_LIKES_TABLE_NAME);
    const UsersTable = storage.getTable(USERS_TABLE_NAME);

    // validate user
    const userInfoQuery = await UsersTable.list({
      filterByFormula: `account_address='${userAddress}'`
    });

    if (isEmpty(userInfoQuery.records)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userInfo = get(userInfoQuery, 'records[0]', {});

    // validate grant
    const grantInfoQuery = await GrantsTable.list({
      filterByFormula: `grant_id='${grantId}'`
    });

    if (isEmpty(grantInfoQuery.records)) {
      return res.status(404).json({ error: 'Grant not found' });
    }

    const grantInfo = get(grantInfoQuery, 'records[0]', {});

    // find if user already submitted his likes
    const existingLikesQuery = await GrantLikesTable.list({
      filterByFormula: `AND(
          grant_id='${grantInfo.fields.grant_id}',
          user_id='${userInfo.fields.user_id}'
        )`
    });

    let status;
    if (isEmpty(existingLikesQuery.records)) {
      status = await GrantLikesTable.create({
        fields: {
          user_id: [userInfo.id],
          grant_id: [grantInfo.id],
          num_likes: numLikes,
        }
      });
    } else {
      const existingLikes = get(existingLikesQuery, 'records[0]', {});
      status = await GrantLikesTable.update(existingLikes.id, {
        num_likes: numLikes,
      });
    }

    res.json({
      status,
    });
  } catch (e) {
    res.status(400).json(e);
  }
};

module.exports = {
  proposals,
  likeProject,
};
