'use strict';

const {Datastore} = require('@google-cloud/datastore');

// Creates a client
const datastore = new Datastore();

/**
 * @param thingToSave Object
 * @param kindOfThing String
 * @param idOfThing String
 * @return {Promise<never>|Promise<google.datastore.v1.ICommitResponse>}
 */
const putEntityInDB = (thingToSave, kindOfThing, idOfThing) => {
  if (typeof thingToSave === 'undefined' || typeof kindOfThing === 'undefined')
    return Promise.reject(new Error(`Cannot save undefined thing or kind!`));
  // The Cloud Datastore key for the entity
  const keyForThing = datastore.key(idOfThing ? [kindOfThing, idOfThing] : kindOfThing);

  const entityToSave = {
    key: keyForThing,
    data: thingToSave,
  };

  return datastore.save(entityToSave).then(response => response[0]);
};

/**
 * @param kindOfThing String
 * @param count Number
 * @param offset Number
 * @return {Promise<never>|Promise<Entity[]>}
 */
const getAllOfKind = (kindOfThing, count, offset) => {
  if (![kindOfThing, count, offset].every(arg => typeof arg !== 'undefined'))
    return Promise.reject(new Error(`Some arguments are undefined!`));
  const query = datastore
    .createQuery(kindOfThing)
    .offset(offset ? offset : 0)
    .limit(count);
  return datastore.runQuery(query).then(([allOfKind]) => allOfKind);
};

/**
 * @param kindOfThing
 * @param fieldToSearch
 * @param needle
 * @return {Promise<never>|Promise<Entity[]>}
 */
const getDocumentsByField = (kindOfThing, fieldToSearch, needle) => {
  if (![kindOfThing, fieldToSearch, needle].every(arg => typeof arg !== 'undefined'))
    return Promise.reject(new Error(`Some arguments are undefined!`));
  const query = datastore.createQuery(kindOfThing).filter(fieldToSearch, '=', needle);
  return datastore.runQuery(query).then(([allOfKind]) => allOfKind);
};

module.exports = {
  putEntityInDB,
  getAllOfKind,
  getDocumentsByField,
};
