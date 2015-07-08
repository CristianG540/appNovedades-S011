/**
 * Tarea que se encargde enviar un email, para recordarle al usario
 * que revice el resumen de novedades.
 **/
var Mandrill = require('machinepack-mandrill');

module.exports = {
  run: function () {

    User.find().exec(function(err, users) {
      if(err){ sails.log.error('Error al recuperar los usuarios de la bd en la tarea cron', err); }
      if(!users){ sails.log.warn('No se encontraron usuarios en la base de datos tara cron'); }

      var emails = _.map(users, function(v, k, l){
        return v.email;
      });

      sendMail(emails);
    });

    function sendMail(emails){

      Mandrill.sendPlaintextEmail({
        apiKey: "OonTnoExdD95f26TfHQYiA",
        toEmails: emails,
        subject: "Recordatorio resumen de novedades",
        message: 'Gracias por usar AppNovedades.\nRecuerde revisar su resumen diario de novedades ingresando a la aplicacion y dirigiendose a la siguiente direccion.\n\n \'http://localhost:1337/resumen\'.\n\n',
        fromEmail: "cg@innovapues.com",
        fromName: "Innova"
      }).exec({
        // An unexpected error occurred.
        error: function (err) {
          sails.log.error('Error al enviar el correo de resumen', err);
        },
        // OK.
        success: function () {
          sails.log.info('El correo se ha enviado sin problemas', emails);
        }
      });

    }

  }
};
