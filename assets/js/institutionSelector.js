/**
 * Created by cowboy on 24/06/15.
 */

$(document).ready(function () {

  // constructs the suggestion engine
  var institutionData = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('institucionEducativa'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '/data/institutionsNoDuplicate.json',
    remote: {
      url: '/institutionData/noDuplicate'
    }
  });

  $('#institution').select2({
    ajax: {
      url: '/institutionData/noDuplicate',
      dataType: 'json',
      delay: 250,
      data: function (params) {
        return {
          q: params.term // search term
        };
      },
      processResults: function (data, page) {
        // parse the results into the format expected by Select2.
        // since we are using custom formatting functions we do not need to
        // alter the remote JSON data
        var newFormat = _.map(data, function(v, k, l){
          return {
            id   : v.id,
            text : v.institucionEducativa
          }
        });

        return {
          results: newFormat
        };
      },
      cache: true
    },
    minimumInputLength: 1,
    language: "es"
  });

});
