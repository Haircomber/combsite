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

    // Highlight the active menu item
    highlightActiveMenuItem();
};

function highlightActiveMenuItem() {
    const currentPage = window.location.pathname.split("/").pop(); // Gets the current page filename
    const menuItems = document.querySelectorAll('.nav-links a');

    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active-menu-item'); // Add the 'active-menu-item' class to the matching menu item
        }
    });

    function addImageToCollage(imgSrc) {
        const leftCollage = document.querySelector('.image-collage-left');
        const rightCollage = document.querySelector('.image-collage-right');
        
        // Create a new image element
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
            // Compare the total height of images in both collages
            const leftHeight = getTotalHeightOfImages(leftCollage);
            const rightHeight = getTotalHeightOfImages(rightCollage);
    
            // Append the new image to the shorter collage
            if (leftHeight <= rightHeight) {
                leftCollage.appendChild(img);
            } else {
                rightCollage.appendChild(img);
            }
        };
    }
    
    function getTotalHeightOfImages(collage) {
        return Array.from(collage.getElementsByTagName('img')).reduce((total, img) => total + img.offsetHeight, 0);
    }
    
    // Example usage: addImageToCollage('path_to_your_image.jpg');
    
}

