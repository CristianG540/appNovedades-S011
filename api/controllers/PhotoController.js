/**
 * PhotoController
 *
 * @description :: Server-side logic for managing Photos
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var fs = require("fs");

module.exports = {
  /**
   * `PhotoController.show()`
   */
  show: function (req, res) {
    var name = req.param('id');
    var size = req.param('size');
    var photosDir = __dirname + "/../../public/photos/";
    fs.exists(photosDir + size + "/" + name + ".jpg", function(exists) {
      var photo = "fake";
      if (exists) {
        photo = name;
      }
      fs.readFile(photosDir + size + "/" + photo + ".jpg", function(err, img) {
        res.writeHead(200, {'Content-Type': 'image/jpeg' });
        return res.end(img, 'binary');
      });
    });
  }
};

