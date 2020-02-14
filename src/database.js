'use strict';

const {Datastore} = require('@google-cloud/datastore');

// Creates a client
const datastore = new Datastore();

const NESTED_ARRAY_KEY = 'array: ';

/**
 * @param obj Object
 */
const transformObjectToDatastore = obj => {
  const transformValue = (val, prop) => {
    if (Array.isArray(val)) {
      return {
        name: prop,
        value: val.map(v => (Array.isArray(v) ? NESTED_ARRAY_KEY + JSON.stringify(v) : v)),
        exclude_from_indexes: true,
      };
    } else {
      return {
        name: prop,
        value: val,
      };
    }
  };
  const entityToSave = [];
  Object.keys(obj).forEach(prop => entityToSave.push(transformValue(obj[prop], prop)));
  return entityToSave;
};

const extractObject = obj => {
  const restoreNestedArrays = arr => {
    return arr.map(val => {
      if (typeof val === 'string' && val.startsWith(NESTED_ARRAY_KEY)) {
        return JSON.parse(val.substring(NESTED_ARRAY_KEY.length));
      } else return val;
    });
  };
  Object.keys(obj).forEach(
    prop => (obj[prop] = Array.isArray(obj[prop]) ? restoreNestedArrays(obj[prop]) : obj[prop])
  );
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

  let transformForDatastore = {};
  try {
    transformForDatastore = transformObjectToDatastore(thingToSave);
  } catch (e) {
    return Promise.reject(e);
  }

  const entityToSave = {
    key: keyForThing,
    data: transformForDatastore,
  };

  return datastore.save(entityToSave).then(response => response[0].mutationResults[0].key);
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

module.exports = {
  putEntityInDB,
  getAllOfKind,
  getDocumentsByField,
};
