import { ObjectId } from 'mongodb';
// Object containing utility methods for input validation.
const exportedMethods = {
  //Checks if a given ID is a non-empty string and a valid MongoDB ObjectId.
  checkId(id, varName) {
    // Check if the ID is provided.
    if (!id) throw `Error: You must provide a ${varName}`;
    // Check if the ID is a string.
    if (typeof id !== 'string') throw `Error: ${varName} must be a string`;
    // Trim any leading or trailing whitespace from the ID.
    id = id.trim();
    // Check if the ID is empty after trimming.
    if (id.length === 0) throw `Error: ${varName} cannot be empty`;
    // Check if the ID is a valid MongoDB ObjectId.
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    // Return the valid trimmed ID.
    return id;
  },
  //Checks if a given value is a non-empty string after trimming.
  checkString(strVal, varName) {
    //// Check if a value is provided.
    if (!strVal) throw `Error: You must supply a ${varName}`;
    //// Check if the value is a string.
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string`;
    // Trim leading and trailing whitespace.
    strVal = strVal.trim();
    //// Check if the string is empty after trimming.
    if (strVal.length === 0) throw `Error: ${varName} cannot be empty`;
    // Return the valid trimmed string.
    return strVal;
  },
  //Checks if a given value is an array containing only non-empty strings after trimming.
  checkStringArray(arr, varName) {
    // Check if the value is an array.
    if (!arr || !Array.isArray(arr)) throw `Error: You must provide an array of ${varName}`;
    // An empty array is considered valid.
    if (arr.length === 0) return arr;
    // Iterate over each element in the array.
    for (let i in arr) {
      // Check if the element is not a string or is empty after trimming.
      if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
        throw `Error: One or more elements in ${varName} array is invalid`;
      }
      // Trim each string element in the array.
      arr[i] = arr[i].trim();
    }
    // Return the array with trimmed string elements.
    return arr;
  },
  //Checks if a given value is a number, and optionally within a specified range.
  checkNumber(num, varName, min = undefined, max = undefined) {
    // Check if the value is a number and not NaN.
    if (typeof num !== 'number' || isNaN(num)) throw `Error: ${varName} must be a valid number`;
    // Check if a minimum value is provided and if the number is less than it.
    if (min !== undefined && num < min) throw `Error: ${varName} must be at least ${min}`;
    // Check if a maximum value is provided and if the number is greater than it.
    if (max !== undefined && num > max) throw `Error: ${varName} cannot exceed ${max}`;
    // Return the valid number.
    return num;
  }
};

export default exportedMethods;