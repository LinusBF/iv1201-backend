'use strict';

const {Datastore} = require('@google-cloud/datastore');

// Creates a client
const datastore = new Datastore();

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

const getAllOfKind = (kindOfThing, count, offset) => {
  if (![kindOfThing, count, offset].every(arg => typeof arg !== 'undefined'))
    return Promise.reject(new Error(`Some arguments are undefined!`));
  const query = datastore
    .createQuery(kindOfThing)
    .offset(offset ? offset : 0)
    .limit(count);
  return datastore.runQuery(query).then(([allOfKind]) => allOfKind);
};

module.exports = {
  putEntityInDB,
  getAllOfKind,
};
