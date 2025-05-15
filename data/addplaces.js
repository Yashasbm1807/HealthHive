import { places } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';


export const createPlace = async (name, type, servicesOffered, address, city, description, tags, addedBy) => {
  if (!ObjectId.isValid(addedBy)) {
    throw new Error(`Invalid user ID format: ${addedBy}`);
  }

  const placesCollection = await places();
  const placeToInsert = {
    name: name.trim(),
    type: type.trim(),
    servicesOffered: servicesOffered.map(s => s.trim()),
    address: address.trim(),
    city: city.trim(),
    description: description.trim(),
    tags: tags.map(t => t.trim()),
    addedBy: new ObjectId(addedBy),
    averageRating: 0,
    reviewCount: 0,
    dateAdded: new Date(),
    
  };

  const result = await placesCollection.insertOne(placeToInsert);
  if (!result.acknowledged) {
    throw new Error('Database did not acknowledge the insertion');
  }

  const foundPlace = await placesCollection.findOne({ _id: result.insertedId });
  if (!foundPlace) {
    throw new Error('Place was not found after creation');
  }

  return foundPlace;
};

export const getAllPlaces = async () => {
  const placesCollection = await places();
  return await placesCollection.find({}).toArray();
};

export const getPlaceById = async (id) => {
  if (!ObjectId.isValid(id)) throw new Error('Invalid ID');
  
  const placesCollection = await places();
  const place = await placesCollection.findOne({ _id: new ObjectId(id) });
  
  if (!place) throw new Error('Place not found');
  
  if (!Array.isArray(place.servicesOffered)) {
    place.servicesOffered = place.servicesOffered 
      ? [place.servicesOffered] 
      : [];
  }
  
  if (!Array.isArray(place.tags)) {
    place.tags = place.tags ? [place.tags] : [];
  }
  
  place.addedBy = place.addedBy.toString();
  return place;
};

export const updatePlace = async (placeId, userId, updateData) => {
  if (!ObjectId.isValid(placeId)) throw new Error('Invalid place ID');
  if (!ObjectId.isValid(userId)) throw new Error('Invalid user ID');

  const placesCollection = await places();
  const placeObjId = new ObjectId(placeId);
  const userObjId = new ObjectId(userId);

  const existingPlace = await placesCollection.findOne({ _id: placeObjId });
  if (!existingPlace) throw new Error('Place not found');
  if (!existingPlace.addedBy.equals(userObjId)) {
    throw new Error('You are not the owner');
  }

  const updateDoc = {
    $set: {
      name: updateData.name.trim(),
      type: updateData.type.trim(),
      servicesOffered: Array.isArray(updateData.servicesOffered) 
        ? updateData.servicesOffered.map(s => s.trim())
        : updateData.servicesOffered.split(',').map(s => s.trim()),
      address: updateData.address.trim(),
      city: updateData.city.trim(),
      description: updateData.description.trim(),
      tags: Array.isArray(updateData.tags)
        ? updateData.tags.map(t => t.trim())
        : updateData.tags.split(',').map(t => t.trim())
      
    }
  };

  const result = await placesCollection.updateOne(
    { _id: placeObjId, addedBy: userObjId },
    updateDoc
  );

  if (result.modifiedCount === 0 && result.matchedCount === 0) {
    throw new Error('Update operation failed - no documents matched');
  }

  const updatedPlace = await placesCollection.findOne({ _id: placeObjId });
  return updatedPlace;
};

export const deletePlace = async (placeId, userId) => {
  if (!ObjectId.isValid(placeId)) throw new Error('Invalid place ID');
  if (!ObjectId.isValid(userId)) throw new Error('Invalid user ID');

  const placesCollection = await places();
  const placeObjId = new ObjectId(placeId);
  const userObjId = new ObjectId(userId);

  const place = await placesCollection.findOne({ _id: placeObjId });
  if (!place) throw new Error('Place not found');
  if (!place.addedBy.equals(userObjId)) {
    throw new Error('You can only delete places you created');
  }

  const result = await placesCollection.deleteOne({ 
    _id: placeObjId,
    addedBy: userObjId 
  });

  if (result.deletedCount === 0) {
    throw new Error('Delete operation failed - no documents deleted');
  }

  return { success: true };
};


// data/addplaces.js
export const getPlacesByUser = async (userId) => {
  try {
    if (!ObjectId.isValid(userId)) {
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    const placesCollection = await places();
    const query = { addedBy: new ObjectId(userId) };
    console.log('MongoDB Query:', query); // Debug log
    
    const userPlaces = await placesCollection.find(query).toArray();
    return userPlaces;
  } catch (e) {
    console.error('Error in getPlacesByUser:', e);
    throw e;
  }
};