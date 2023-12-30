document.addEventListener('DOMContentLoaded', function() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const headerElement = document.querySelector('.header');
            headerElement.innerHTML = data;

            // Explicitly hide the dropdown content after adding the header HTML
            const dropdowns = headerElement.querySelectorAll('.dropdown-content');
            dropdowns.forEach(function(dropdown) {
                dropdown.style.display = 'none';
            });

            // Initialize dropdown functionality
            initializeDropdown(headerElement);
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
}

document.addEventListener('DOMContentLoaded', function() {
    // Existing code to load the header...

    // Code to load the footer
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerElement = document.querySelector('footer');
            footerElement.innerHTML = data;
        });
});
