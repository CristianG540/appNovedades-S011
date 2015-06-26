/**
 * FeedController
 *
 * @description :: Server-side logic for managing Feeds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require("moment");
moment.locale('es');

function inflateTweetAuthors(tweets, callback) {
  async.map(tweets, function(tweet, next) {
    User.findOne({id: tweet.authorId}, function(err, user) {
      tweet.author = user;
      next(null, tweet);
    })
  }, function(err, tweets) {
    callback(tweets);
  });
}

function feedTweersForUser(user, callback) {
  user.following.push(user.id);
  var or = _.map(user.following, function(v) {
    return {
      authorId : v
    };
  });
  or.push({ institution : user.institution });


  Tweet.find({
    where: {
      or : or
    },
    sort: 'createdAt DESC',
    limit: 50
  })
    .exec(function(err, tweets) {
      inflateTweetAuthors(tweets, callback);
    });
}

function feedTweersForInstitution(institution, callback) {

  Tweet.find({
    where: {
      institution : institution
    },
    sort: 'createdAt DESC',
    limit: 50
  })
    .exec(function(err, tweets) {
      inflateTweetAuthors(tweets, callback);
    });

}

function displayFeed(view, hasLayout, widget) {
  return function(req, res, next) {
    if(!widget){
      feedTweersForUser(currentUser, function(tweets) {
        var data = {
          data: {
            tweets: tweets,
            emptyMessage: 'No hay novedades en este momento.'
          },
          moment: moment
        };
        if (!hasLayout) {
          data.layout = null;
        }
        return res.view(view, data);
      });
    }else if(widget == 'widget'){

      feedTweersForInstitution(req.param('institution'), function(tweets) {
        var data = {
          data: {
            tweets: tweets,
            emptyMessage: 'No hay novedades en este momento.'
          },
          moment: moment
        };

        data.layout = 'layoutWidget';

        return res.view(view, data);
      });
    }else if(widget == 'last'){
      feedTweersForInstitution(req.param('institution'), function(tweets) {
        var data = {
          data: {
            tweets: tweets,
            emptyMessage: 'No hay novedades en este momento.'
          },
          moment: moment
        };

        if (!hasLayout) {
          data.layout = null;
        }

        return res.view(view, data);
      });
    }

  };
}

module.exports = {
  index      : displayFeed('feed/index', true, false),
  last       : displayFeed('tweet/index', false, false),
  widget     : displayFeed('feed/indexWidget', true, 'widget'),
  lastWidget : displayFeed('tweet/index', false, 'last')
};

