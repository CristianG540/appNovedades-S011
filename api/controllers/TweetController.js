/**
 * TweetController
 *
 * @description :: Server-side logic for managing Tweets
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  create: function (req, res, next) {
    var data = req.params.all();
    data.authorId = req.session.passport.user;
    if(data.priority){
      data.priority = parseInt(data.priority);
    }
    if(currentUser.institution){
      data.institution = currentUser.institution;
    }

    Tweet.create(data, function (err, tweet) {
      if (err) {
        req.session.flash = {
          err: err
        };
      }

      return res.redirect('back');
    });
  }
};

