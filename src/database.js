'use strict';

const {Datastore} = require('@google-cloud/datastore');

// Creates a client
const datastore = new Datastore();

const extractObject = obj => {
  const symbolKey = Reflect.ownKeys(obj).find(key => key.toString() === 'Symbol(KEY)');
  obj.uid = obj[symbolKey].id;
  return obj;
};

/**
 * @param thingToSave Object
 * @param kindOfThing String
 * @param idOfThing String
 * @return {Promise<never>|Promise<google.datastore.v1.MutationResult.key>}
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
  return datastore.save(entityToSave).then(response => response[0].mutationResults[0].key);
};

/**
 * @param kindOfThing String
 * @param sortBy String
 * @param count Number
 * @param offset Number
 * @return {Promise<never>|Promise<Entity[]>}
 */
const getAllOfKind = (kindOfThing, sortBy, count, offset) => {
  if (![kindOfThing, sortBy, count, offset].every(arg => typeof arg !== 'undefined'))
    return Promise.reject(new Error(`Some arguments are undefined!`));
  const query = datastore
    .createQuery(kindOfThing)
    .order(sortBy, {descending: true})
    .offset(offset ? offset : 0)
    .limit(count);
  return datastore.runQuery(query).then(([allOfKind]) => allOfKind.map(extractObject));
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
  return datastore.runQuery(query).then(([allOfKind]) => allOfKind.map(extractObject));
};

/**
 * @param kindOfThing String
 * @param idOfThing Number
 * @return {Promise<never>|Promise<Entity[]>}
 */
const getDocumentsById = (kindOfThing, idOfThing) => {
  if (![kindOfThing, idOfThing].every(arg => typeof arg !== 'undefined'))
    return Promise.reject(new Error(`Some arguments are undefined!`));
  const docKey = datastore.key([kindOfThing, idOfThing]);
  return getDocumentsByField(kindOfThing, '__key__', docKey);
};

/**
 * @param kindOfThing String
 * @param idOfThing Number
 * @param fieldToSet String
 * @param valueToSet
 * @return {Promise<never>|Promise<Boolean>|Promise<T | void | google.datastore.v1.RollbackResponse | [google.datastore.v1.IRollbackResponse] | [DatastoreClient.RollbackResponse]>}
 */
const setFieldInDocument = (kindOfThing, idOfThing, fieldToSet, valueToSet) => {
  if (![kindOfThing, idOfThing, fieldToSet, valueToSet].every(arg => typeof arg !== 'undefined'))
    return Promise.reject(new Error(`Some arguments are undefined!`));
  const docKey = datastore.key([kindOfThing, idOfThing]);
  const transaction = datastore.transaction();
  return transaction
    .run()
    .then(() => transaction.get(docKey))
    .then(result => result[0])
    .then(docToUpdate => {
      docToUpdate[fieldToSet] = valueToSet;
      transaction.save([
        {
          key: docKey,
          data: docToUpdate,
        },
      ]);
      return transaction.commit().then(result => !result[0].mutationResults[0].conflictDetected);
    })
    .catch(err => {
      console.error(`Status update transaction failed! ${err}`);
      return transaction.rollback();
    });
};

module.exports = {
  putEntityInDB,
  getAllOfKind,
  getDocumentsByField,
  getDocumentsById,
  setFieldInDocument,
};
