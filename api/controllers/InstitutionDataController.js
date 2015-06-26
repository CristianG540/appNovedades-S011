/**
 * InstitutionDataController
 *
 * @description :: Server-side logic for managing Institutiondatas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var includeS = require('underscore.string/include');

module.exports = {

  index : function(req, res , next){
    InstitutionData.find().exec(function(err, inst){
      if(err){ return res.serverError(err); }

      // Envia el array de usuarios a la pagina /views/index.ejs
      res.json({
        'institutions': inst
      });
    });
  },

  noDuplicate : function(req, res, next){

    var institUniq,
      instFilter,
      query = req.query.q;

    InstitutionData.find().exec(function(err, inst){

      if(err){ return res.negotiate(err); }

      // con lodash busco los documetos unicos segun el atributo 'daneInstitucion'
      institUniq = _.uniq(inst, 'daneInstitucion');
      // aqui busco los documentos donde el departamento sea antioquia
      institUniq = _.where(institUniq, {'codDepartamento':5});

      instFilter = _.filter(institUniq, function(inst){
        return includeS(inst.institucionEducativa, query.toUpperCase());
      });

      // Envia el array de usuarios a la pagina /views/index.ejs
      res.json(instFilter);
    });

  }

};

