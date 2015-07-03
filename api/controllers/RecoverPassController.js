/**
 * RecoverPassController
 *
 * @description :: Server-side logic for managing Recoverpasses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Emailaddresses = require('machinepack-emailaddresses');
var Mandrill = require('machinepack-mandrill');
var crypto = require('crypto');

module.exports = {

  index: function(req, res, next){
    return res.view('settings/recoverPass');
  },
  recoverPass: function(req, res, next){

    var callback = function (err, user) {

      if(err){ return res.negotiate(err); }
      if(!user){ return res.notFound(); }

      async.auto({
        token: function (cb) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            if(err){ return res.negotiate(err); }

            user.save(function(errUsr, user) {
              cb(errUsr, token);
            });

          });
        }
      },
      function allDone(err, results) {

        if (err) {
          return res.serverError(err);
        }

        Mandrill.sendTemplateEmail({
          apiKey: "OonTnoExdD95f26TfHQYiA",
          toEmail: user.email,
          templateName: "recuperarPass",
          toName: user.name,
          subject: "Recuperacion de contraseña",
          fromEmail: "cg@innovapues.com",
          fromName: "Innova",
          mergeVars : [
            {
              "name": "username",
              "content": user.name
            },{
              "name": "userurl",
              "content": 'http://' + req.headers.host + '/reset/' + results.token
            },
            {
              "name": "appname",
              "content": "AppNovedades"
            },
            {
              "name": "appemail",
              "content": "cg@innovapues.com"
            },
            {
              "name": "appurl",
              "content": 'http://' + req.headers.host
            }
          ]
          /*mergeVars : [
            {
              name: "user",
              content: {
                name : user.name,
                password : user.password
              }
            },
            {
              name: "app",
              content: {
                name : "AppNovedades",
                email : "cg@innovapues.com",
                url : "http://localhost:1337/"
              }
            }
          ]*/
        }).exec({
          // An unexpected error occurred.
          error: function (err) {
            return res.negotiate(err);
          },
          // OK.
          success: function () {
            return res.redirect('/');
          },
        });

      });

    };

    Emailaddresses.validate({
      string: req.param('name_email'),
    }).exec({
      // An unexpected error occurred.
      error: function (err) {
        if(err){ return res.negotiate(err); }
      },
      // The provided string is not an email address.
      invalid: function () {
        User.findOne({username: req.param('name_email')}).exec(callback);
      },
      // OK.
      success: function () {
        User.findOne({email: req.param('name_email')}).exec(callback);
      }
    });

  },
  resetIndex: function (req, res, next) {

    User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        '>': Date.now()
      }
    }, function (err, user) {

      if(!user){ return res.notFound(); }

      return res.view('reset/index', {
        user: user
      });

    });

  },
  resetPass: function (req, res, next) {

    async.auto({
      user: function (cb) {
        User.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: {
            '>': Date.now()
          }
        },
        function (err, user) {

          if(!user){ return res.notFound(); }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err, user) {
            cb(err, user);
          });
        });
      }
    },
    function allDone(err, results) {

      if (err) { return res.serverError(err); }

      Mandrill.sendTemplateEmail({
        apiKey: "OonTnoExdD95f26TfHQYiA",
        toEmail: results.user.email,
        templateName: "confirmReset",
        toName: results.user.name,
        subject: "Tu contraseña ha sido cambiada",
        fromEmail: "cg@innovapues.com",
        fromName: "Innova",
        mergeVars : [
          {
            "name": "username",
            "content": results.user.name
          },
          {
            "name": "appname",
            "content": "AppNovedades"
          },
          {
            "name": "appurl",
            "content": 'http://' + req.headers.host
          }
        ]
      }).exec({
        // An unexpected error occurred.
        error: function (err) {
          return res.negotiate(err);
        },
        // OK.
        success: function () {
          return res.redirect('/');
        },
      });
    });

  }

};

