/**
* HashTag.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  schema: true, // Set schema true/false to only allow fields defined in attributes to be saved. Only for schemaless adapters

  attributes: {
    text: {
      type: 'string',
      maxLength: 40,
      required: true,
      unique: true
    }
  }
};

