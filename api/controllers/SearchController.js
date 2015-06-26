/**
 * SearchController
 *
 * @description :: Server-side logic for managing Searches
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

function signToTag(item) {
  if (item[0] == '@') {
    return 'mention:' + item.substring(1);
  } else if (item[0] == '#') {
    return 'hash:' + item.substring(1);
  } else {
    return 'user:' + item;
  }
}

function extractSearchCriteria(terms) {
  var criteria = { tags: [], users: [], mentions: [] };
  _.forEach(terms, function(term) {
    var item = term.split(':');
    if (item[0] == 'user') {
      criteria.users.push(new RegExp('^' + item[1]));
    } else if (item[0] == 'hash') {
      criteria.tags.push(item[1]);
    } else if (item[0] == 'mention') {
      criteria.mentions.push(item[1]);
    }
  });
  return criteria;
}

function inflateHashTagIds(tags, callback) {
  HashTag.find({text: tags}, function(err, hashTags) {
    async.map(hashTags, function(hashTag, next) {
      next(null, hashTag.id);
    }, function(err, hashTagIds) {
      callback(hashTagIds);
    });
  });
}

function findTweetsThatInclude(tags, mentions, callback) {
  inflateHashTagIds(tags, function(hashTagIds) {
    var criteria = {};
    if (hashTagIds.length > 0) {
      criteria.hashTags = { 'all': hashTagIds };
    }
    if (mentions.length > 0) {
      criteria.mentions = { 'all': mentions };
    }
    if (hashTagIds.length == 0 && mentions.length == 0) {
      if (tags.length == 0 && mentions.length == 0) {
        return callback(null);
      } else {
        return callback([]);
      }
    }
    Tweet.find({ where: criteria, sort: 'createdAt DESC' }, function(err, tweets) {
      async.map(tweets, function(tweet, next) {
          User.findOne({id: tweet.authorId}, function(err, user) {
            tweet.author = user;
            next(null, tweet);
          });
        },
        function(err, tweets) {
          callback(tweets);
        });
    });
  });
}

function findUsers(handles, callback) {
  User.find({username: handles}, function(err, users) {
    if (!users) {
      users = [];
    }
    if (handles.length == 0) {
      users = null;
    }
    callback(users);
  });
}

module.exports = {
  /**
   * `SearchController.new()`
   */
  new: function (req, res) {
    var terms = req.param('terms').replace(/ /g, '').split(',');
    var query = _.map(terms, signToTag).join('&');
    return res.redirect('/search/' + query);
  },

  /**
   * `SearchController.query()`
   */
  query: function (req, res) {
    var terms = req.param('terms').replace(/ /g, '').split('&');
    var query = terms.join(',').replace(/mention:/g, '@').replace(/hash:/g, '#').replace(/user:/g, '');
    var criteria = extractSearchCriteria(terms);
    findTweetsThatInclude(criteria.tags, criteria.mentions, function(tweets) {
      findUsers(criteria.users, function(users) {
        return res.view('search/index', {
          partial_users: 'user/peers',
          partial_tweets: 'tweet/index',
          data: {
            users: users,
            tweets: tweets,
            emptyMessage: 'No results found.'
          },
          search_items: query
        });
      });
    });
  }
};

