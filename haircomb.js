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

            highlightActiveMenuItem(); // Call this here after header is loaded

            setTimeout(() => {
                highlightActiveMenuItem();
            }, 0);

                // Add click event listeners to clickable ASCII art elements
    var clickableElements = document.querySelectorAll('.ascii-banner span.clickable');
    clickableElements.forEach(element => {
        element.addEventListener('click', function() {
            window.location.href = 'pinkpill.html'; // URL of the secret page
        });
    });
        

            // Shuffle images in both collages
            const leftCollageImages = Array.from(document.querySelectorAll('.image-collage-left img'));
            const rightCollageImages = Array.from(document.querySelectorAll('.image-collage-right img'));
        
            shuffleArray(leftCollageImages);
            shuffleArray(rightCollageImages);
        
            const leftCollage = document.querySelector('.image-collage-left');
            const rightCollage = document.querySelector('.image-collage-right');
        
            leftCollage.innerHTML = '';
            rightCollage.innerHTML = '';
        
            leftCollageImages.forEach(img => leftCollage.appendChild(img));
            rightCollageImages.forEach(img => rightCollage.appendChild(img));
    });

        // Fetch and set footer content
        fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerElement = document.querySelector('footer');
            footerElement.innerHTML = data;
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

        // Highlight the active menu item
    highlightActiveMenuItem();
    });
});

function highlightActiveMenuItem() {
    const currentPage = window.location.pathname.split("/").pop();
    console.log('Current Page:', currentPage); // Debug log

    const menuItems = document.querySelectorAll('.nav-links a');

    menuItems.forEach(item => {
        // Only proceed if the item has an href attribute
        if (item.getAttribute('href')) {
            console.log('Menu Item href:', item.getAttribute('href')); // Debug log
            if (item.getAttribute('href').endsWith(currentPage)) {
                console.log('Active Item:', item); // Debug log
                item.classList.add('active-menu-item');
            } else {
                item.classList.remove('active-menu-item');
            }
        }
    });
}

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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
