/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require("moment");
moment.locale('es');

function userPageFor(page) {
  return function(req, res, next) {
    var username = req.param('username');
    User.findOne({username: username}, function(err, user) {
      if (err || !user) {
        return res.view('user/notFound', {
          username: username
        });
      }
      page(user, res, next);
    });
  };
};

function tweetsBy(user, callback) {
  Tweet.find({
    where: {
      authorId: user.id
    }, sort: 'createdAt DESC', limit: 50
  }).exec(function(err, tweets) {
    async.map(tweets, function(tweet, next) {
      User.findOne({id: tweet.authorId}, function(err, user) {
        tweet.author = user;
        next(null, tweet);
      })
    }, function(err, tweets) {
      callback(tweets);
    });
  });
};

function tweets(user, res, next) {
  tweetsBy(user, function(tweets) {
    return res.view('user/show', {
      user: user,
      partial_name: 'user/tweets',
      selected: 'tweets',
      data: {
        tweetsCount: tweets.length,
        tweets: tweets,
        emptyMessage: 'No hay novedades.'
      },
      moment: moment
    });
  });
};

function inflateUsers(userIds, callback) {
  User.find().where({
    id: userIds
  }).exec(function(err, users) {
    callback(users);
  });
};

function relatives(relation) {
  return function(user, res, next) {
    inflateUsers(user[relation], function(relatives) {
      Tweet.count({authorId: user.id}, function(err, tweetsCount) {
        return res.view('user/show', {
          user: user,
          partial_name: 'user/peers',
          selected: relation,
          data: {
            users: relatives,
            tweetsCount: tweetsCount,
            emptyMessage: 'No results found.'
          }
        });
      });
    });
  };
};


module.exports = {
  new: function(req, res) {

    res.view();

  },

  create: function(req, res, next) {

    User.create(req.params.all(), function(err, user) {
      if (err) {
        return res.redirect('/user/new');
      }
      return res.redirect('/' + user.username);
    });
  },

  update: function(req, res, next) {

    var values = {
      name: req.param('name'),
      institution: req.param('institution'),
      cargo: req.param('cargo'),
      bio: req.param('bio'),
      location: req.param('location'),
      website: req.param('website')
    }

    if (req.param('password')) {
      if (req.param('password') == req.param('password_confirmation')) {
        values.password = req.param('password');
      } else {
        return res.redirect('back');
      }
    }

    req.file('avatar').upload({
        maxBytes: 1000000
      },
      function whenDone(err, uploadedFiles) {
        if (err) { return res.negotiate(err); }

        _.each(uploadedFiles, function(uploadedFile, k, l){
          if( uploadedFile && uploadedFile.filename.length > 0 ){
            values.photo = uploadedFile.fd;
            values.photoName = currentUser.id;
          }
        });

        User.update(currentUser.id, values, function(err) {
          if (err) {
            return res.redirect('/settings/profile');
          }
          return res.redirect('/' + currentUser.username);
        });
      });

    /*if (req.files.photo && req.files.photo.originalFilename.length
      && req.files.photo.originalFilename.length > 0) {
      values.photo = req.files.photo.path;
      values.photoName = currentUser.id;
    }*/
  },

  destroy: function(req, res, next) {
    req.logout();

    User.destroy(currentUser.id, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  },

  show: userPageFor(tweets),
  followers: userPageFor(relatives('followers')),
  following: userPageFor(relatives('following'))
};

