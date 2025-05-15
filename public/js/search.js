// This event listener ensures that the code inside runs only after the entire HTML document has been fully loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
  // Check if jQuery library is loaded. If not, log an error to the console and exit the function.
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded');
    return;
  }
  // Get references to various HTML elements from the DOM.
  // The main search form.
  const searchForm = document.getElementById('search-form');
  // The input field for tags.
  const tagsInput = document.getElementById('tags');
  // The container to display error messages.
  const errorContainer = document.getElementById('error-container');
  // The specific element within the error container to show the error text.
  const errorTextElement = errorContainer ? errorContainer.getElementsByClassName('text-goes-here')[0] : null;

  // This function is used to sanitize user input to prevent cross-site scripting (XSS) vulnerabilities.
  const sanitize = (input) => typeof filterXSS === 'function' ? filterXSS(input) : input;
  // If the 'tagsInput' element exists on the page, proceed to implement autocomplete functionality for it.
  if (tagsInput) {
    // Use jQuery's AJAX function to make an asynchronous HTTP GET request to the '/places/tags' endpoint.
    $.ajax({
      url: '/places/tags',   // The URL to fetch the list of available tags from the server.
      method: 'GET', // The HTTP method used for the request.
      // This function is executed if the AJAX request is successful. The 'tags' parameter contains the data received from 
      // the server (presumably an array of tag strings).
      // Initialize the jQuery UI autocomplete widget on the 'tagsInput' element. 
      success: function (tags) {
        $(tagsInput).autocomplete({
          source: tags, // Use the fetched array of tags as the data source for autocomplete suggestions.
          minLength: 1, // Start displaying suggestions after the user has typed at least one character.
          select: function (event, ui) {
            // This function is executed when the user selects a tag from the autocomplete suggestions.
            const currentTags = sanitize(tagsInput.value).split(',').map(t => t.trim()).filter(t => t);
            // Get the current value of the tags input, sanitize it, split it by commas, trim whitespace from each tag, and filter out any empty tags.
            // Check if the selected tag (ui.item.value) is not already present in the current tags.
            if (!currentTags.includes(ui.item.value)) {
              // Add the selected tag to the array of current tags.
              currentTags.push(ui.item.value); 
              // Update the value of the tags input field with the new list of tags (joined by commas).
              tagsInput.value = currentTags.join(', '); 
            }
            // Prevent the default behavior of the select event, which might be to fill the input with 
            // the selected value again (we've already handled it).
            return false;
          }
        });
      },
      error: function () {
        // This function is executed if the AJAX request fails.
        console.error('Failed to load tags for autocomplete');
      }
    });
  }
  // If the 'searchForm' element exists on the page, add an event listener to its 'submit' event.
  if (searchForm) {
    // This function is executed when the search form is submitted.
    searchForm.addEventListener('submit', (event) => {
      // Get the values of the search input fields, sanitize them, and trim any leading/trailing whitespace.
      const name = sanitize(document.getElementById('name').value.trim());
      const type = sanitize(document.getElementById('type').value.trim());
      const city = sanitize(document.getElementById('city').value.trim());
      const tags = sanitize(document.getElementById('tags').value.trim());
      const minRating = sanitize(document.getElementById('minRating').value.trim());
      // Get the selected value from the sort by dropdown.
      const sortBy = sanitize(document.getElementById('sortBy').value);
      // Check if all search criteria are empty. If so, display an error message and prevent form submission.
      if (!name && !type && !city && !tags && !minRating && !sortBy) {
        errorTextElement.textContent = 'Please provide at least one search criterion';
        errorContainer.classList.remove('hidden'); // Make the error container visible.
        event.preventDefault(); // Prevent the default form submission.
        // Exit the event listener function.
        return;
      }
      // Validate the 'minRating' input if it has a value.
      if (minRating && (isNaN(minRating) || minRating < 0 || minRating > 5)) {
        // If 'minRating' is not a number or is outside the valid range (0-5), display an error message and prevent form submission.
        errorTextElement.textContent = 'Minimum rating must be a number between 0 and 5';
        errorContainer.classList.remove('hidden'); // Make the error container visible.
        event.preventDefault(); // Prevent the default form submission.
      } else if (errorContainer) {
        // If the 'minRating' is valid (or not provided), ensure the error container is hidden (in case it was previously shown).
        errorContainer.classList.add('hidden');
      }
    });
  }
});