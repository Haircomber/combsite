document.addEventListener('DOMContentLoaded', function() {
    // Fetch and set header content
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const headerElement = document.querySelector('.header');
            headerElement.innerHTML = data;

            // Explicitly hide the dropdown content after adding the header HTML
            const dropdowns = headerElement.querySelectorAll('.dropdown-content');
            dropdowns.forEach(dropdown => dropdown.style.display = 'none');

            // Initialize dropdown functionality
            initializeDropdown(headerElement);
        });

    // Fetch and set footer content
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerElement = document.querySelector('footer');
            footerElement.innerHTML = data;
        });

    // Add click event listeners to clickable ASCII art elements
    var clickableElements = document.querySelectorAll('.ascii-banner span.clickable');
    clickableElements.forEach(element => {
        element.addEventListener('click', function() {
            window.location.href = 'pinkpill.html'; // URL of the secret page
        });
    });
});

function initializeDropdown(header) {
    // Event delegation for showing the dropdown
    header.addEventListener('mouseover', function(event) {
        if (event.target.closest('.dropdown')) {
            event.target.closest('.dropdown').querySelector('.dropdown-content').style.display = 'block';
        }
    });

    // Event delegation for hiding the dropdown
    header.addEventListener('mouseout', function(event) {
        if (event.target.closest('.dropdown')) {
            event.target.closest('.dropdown').querySelector('.dropdown-content').style.display = 'none';
        }
    });

// Function to scroll to the feature
function scrollToFeature(featureId) {
    const featureElement = document.getElementById(featureId);
    if (featureElement) {
        featureElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add click event to each title
document.querySelectorAll('.feature-titles .title').forEach(function(title) {
    title.addEventListener('click', function() {
        // Get the feature ID from the data-target attribute
        const featureId = this.getAttribute('data-target');
        scrollToFeature(featureId);
    });
});

}
