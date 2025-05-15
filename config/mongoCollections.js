// config/mongoCollections.js

import { connectToDb } from './mongoConnection.js';

const getCollectionFn = (collectionName) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await connectToDb();
      _col = await db.collection(collectionName);
    }
    return _col;
  };
};

export const users = getCollectionFn('users');
export const places = getCollectionFn('places');
export const reviews = getCollectionFn('reviews');
export const photos = getCollectionFn('photos');
export const reports = getCollectionFn('reports');
export const bookmarks = getCollectionFn('bookmarks');
export const pendingPlaces = getCollectionFn('pendingPlaces');

