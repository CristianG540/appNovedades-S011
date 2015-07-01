/**
 * SettingsController
 *
 * @description :: Server-side logic for managing Settings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Emailaddresses = require('machinepack-emailaddresses');
var Mandrill = require('machinepack-mandrill');

module.exports = {
  profile: function(req, res, next) {
    InstitutionData.findOne(currentUser.institution).exec(function(err, inst){

      if(err){ return res.serverError(err); }

      // Envia el array de usuarios a la pagina /views/index.ejs
      res.view({
        'institution': inst
      });
    });
  },
  indexRecoverPass: function(req, res, next){
    debugger;
    return res.view('settings/recoverPass');
  },
  recoverPass: function(req, res, next){

    debugger;

    var callback = function (user) {
      debugger;

      if(!user){ return res.notFound(); }

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
            "name": "userpassword",
            "content": user.password
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
            "content": "http://localhost:1337/"
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
        User.findOne({username: req.param('name_email')}).exec(function(err, user) {
          debugger;
          if(err){ return res.negotiate(err); }
          callback(user);
        });
      },
      // OK.
      success: function () {
        User.findOne({email: req.param('name_email')}).exec(function(err, user) {
          debugger;
          if(err){ return res.negotiate(err); }
          callback(user);
        });
      }
    });


  }
};

