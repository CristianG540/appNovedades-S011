/**
 * SettingsController
 *
 * @description :: Server-side logic for managing Settings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  profile: function(req, res, next) {
    InstitutionData.findOne(currentUser.institution).exec(function(err, inst){

      if(err){ return res.serverError(err); }

      // Envia el array de usuarios a la pagina /views/index.ejs
      res.view({
        'institution': inst
      });
    });
  }
};

