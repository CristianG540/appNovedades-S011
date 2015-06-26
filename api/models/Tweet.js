/**
* Tweet.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

function assignHashTags(values) {
  return function(callback) {
    var hashTags = values.content.match(/#([^\s]*)/g);

    if (!hashTags) {
      return callback(null);
    }

    async.map(hashTags, function(tag, next) {
      var content = tag.replace('#', '');
      HashTag.findOrCreate({text: content}, {text: content}, function(err, hashTag) {
        next(null, hashTag.id);
      });
    }, function(err, hashTagIds) {
      values.hashTags = hashTagIds;
      return callback(null);
    });
  };
};

function assignMentions(values) {
  return function(callback) {
    var mentions = values.content.match(/@([^\s]*)/g);

    if (!mentions) {
      return callback(null);
    }

    async.map(mentions, function(mention, next) {
      next(null, mention.replace('@', ''));
    }, function(err, userIds) {
      values.mentions = userIds;
      return callback(null);
    });
  };
};

module.exports = {

  schema: true, // Set schema true/false to only allow fields defined in attributes to be saved. Only for schemaless adapters

  attributes: {

    authorId: {
      type: 'string',
      required: true
    },

    content: {
      type: 'string',
      maxLength: 140,
      required: true
    },

    location: {
      type: 'string',
      maxLength: 100,
      required: false
    },

    priority: {
      type: 'integer',
      defaultsTo: 3,
      enum: [1, 2, 3]
    },

    institution: {
      type: 'string'
    },

    hashTags: {
      type: 'array',
      defaultsTo: []
    },

    mentions: {
      type: 'array',
      defaultsTo: []
    }
  },

  beforeCreate: function(values, next) {
    async.waterfall([
      assignHashTags(values),
      assignMentions(values)
    ], next);
  }
};

