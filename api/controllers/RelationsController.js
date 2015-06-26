/**
 * RelationsController
 *
 * @description :: Server-side logic for managing Relations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

function performRelation(action, user, targetUser) {
  var data = action(user, targetUser.id);
  User.update(user.id, data, function(err, models) {
    User.publishUpdate(user.id, models[0].toJSON());
  });
}

function add(type) {
  return function(user, targetUserId) {
    var data = {};
    if (user && user[type].indexOf(targetUserId) == -1) {
      data[type] = user[type].concat(targetUserId);
    }
    return data;
  };
}

function remove(type) {
  return function(user, targetUserId) {
    var data = {};
    if (user) {
      data[type] = user[type].filter(function(id) {
        return id != targetUserId;
      });
    }
    return data;
  };
}

function relation(action) {
  return function(req, res, next) {
    User.findOne({username: req.param('username')}, function(err, targetUser) {
      if (err || !targetUser) {
        return next(err);
      }

      performRelation(action('following'), currentUser, targetUser);
      performRelation(action('followers'), targetUser, currentUser);
      return res.redirect('/' + targetUser.username);
    });
  };
}

module.exports = {
  follow: relation(add),
  unfollow: relation(remove)
};

