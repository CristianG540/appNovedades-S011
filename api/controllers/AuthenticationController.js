/**
 * AuthenticationController
 *
 * @description :: Server-side logic for managing Authentications
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var passport = require('passport');

module.exports = {
  login: function(req, res) {
    passport.authenticate('local', function(err, user, info) {
      if ((err) || (!user)) {
        return res.redirect('/');
      }
      req.logIn(user, function(err) {
        if (err) {
          return res.redirect('/login');
        }
        return res.redirect('/');
      });
    })(req, res);
  },

  logout: function (req,res){
    req.logout();
    return res.redirect('/');
  }
};

