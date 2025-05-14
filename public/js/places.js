(function () {
   // Get the edit place form element from the DOM.
  const editPlaceForm = document.getElementById('edit-place-form');
  // Get the container element for displaying errors.
  const errorContainer = document.getElementById('error-container');
  // Get the specific text element within the error container where error messages will be shown.
  const errorTextElement = errorContainer ? errorContainer.getElementsByClassName('text-goes-here')[0] : null;

  // Function to sanitize user input using the filterXSS function if it exists, otherwise it returns the raw input.
  const sanitize = (input) => typeof filterXSS === 'function' ? filterXSS(input) : input; // Fallback to raw input if xss not loaded
  
  // Function to validate the input fields of the edit place form.
  const validateForm = (form) => {
    // Get references to all the relevant input elements within the form.
    const inputs = {
      name: form.querySelector('#name'),
      type: form.querySelector('#type'),
      servicesOffered: form.querySelector('#servicesOffered'),
      address: form.querySelector('#address'),
      city: form.querySelector('#city'),
      description: form.querySelector('#description'),
      tags: form.querySelector('#tags')
    };
    // Array to store any validation error messages.
    const errors = [];
    // Sanitize the values of all input fields by trimming whitespace and applying XSS protection.
    const sanitizedInputs = {
      name: sanitize(inputs.name.value.trim()),
      type: sanitize(inputs.type.value.trim()),
      servicesOffered: sanitize(inputs.servicesOffered.value.trim()),
      address: sanitize(inputs.address.value.trim()),
      city: sanitize(inputs.city.value.trim()),
      description: sanitize(inputs.description.value.trim()),
      tags: sanitize(inputs.tags.value.trim())
    };
    // Check if the 'name' field is empty and add an error message if it is.
    if (!sanitizedInputs.name) errors.push('Name is required');
    // Check if the 'type' field is empty and add an error message if it is.
    if (!sanitizedInputs.type) errors.push('Type is required');
    // Check if the 'servicesOffered' field is empty and add an error message if it is.
    if (!sanitizedInputs.servicesOffered) errors.push('Services Offered is required');
    // Check if the 'address' field is empty and add an error message if it is.
    if (!sanitizedInputs.address) errors.push('Address is required');
    // Check if the 'city' field is empty and add an error message if it is.
    if (!sanitizedInputs.city) errors.push('City is required');
    // Check if the 'description' field is empty and add an error message if it is.
    if (!sanitizedInputs.description) errors.push('Description is required');
    // If the 'tags' field has a value, split it by commas and check if any of the resulting tags are empty after trimming.
    if (sanitizedInputs.tags && sanitizedInputs.tags.split(',').some(tag => !tag.trim())) {
      errors.push('Tags must be non-empty if provided');
    }
    // If there are any errors in the 'errors' array, display them in the error container and 
    // return false (indicating validation failure).
    if (errors.length > 0) {
      errorTextElement.textContent = `Form errors: ${errors.join(', ')}`;
      errorContainer.classList.remove('hidden');
      return false;
    }
    // If there are no errors, return true (indicating successful validation).
    return true;
  };
  // Check if the 'editPlaceForm' element exists in the DOM.
  if (editPlaceForm) {
    // Add an event listener to the form's 'submit' event.
    editPlaceForm.addEventListener('submit', (event) => {
      // Call the 'validateForm' function when the form is submitted.
      if (!validateForm(editPlaceForm)) {
        // If validation fails, prevent the default form submission behavior.
        event.preventDefault();
      } else {
        // If validation passes, hide the error container (in case it was previously visible).
        errorContainer.classList.add('hidden');
      }
    });
  }
})();