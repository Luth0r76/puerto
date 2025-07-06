// Global variables for user's location
let userLat = null;
let userLng = null;
let currentZone = '1'; // Default to Zone 1

document.addEventListener('DOMContentLoaded', function() {
    const openMapsButtons = document.querySelectorAll('.open-maps-btn');
    const addressSearchInput = document.getElementById('addressSearchInput');
    const searchAddressButton = document.getElementById('searchAddressButton');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const allLocationItems = document.querySelectorAll('.location-item');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const zoneHeadings = document.querySelectorAll('.zone-heading');
    const themeToggleButton = document.getElementById('themeToggleButton');
    const body = document.body;
    const ubicacionesDestacadasTitle = document.getElementById('ubicacionesDestacadasTitle');
    const mainMapImage = document.getElementById('mainMapImage');
    const mainContentContainer = document.getElementById('mainContentContainer');
    const geolocationStatus = document.getElementById('geolocationStatus');
    const showZone1Button = document.getElementById('showZone1Button');
    const showZone2Button = document.getElementById('showZone2Button');

    // Function to request geolocation permission
    function requestGeolocation() {
        if (navigator.geolocation) {
            geolocationStatus.textContent = 'Obteniendo ubicación... 🌍';
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    userLat = position.coords.latitude;
                    userLng = position.coords.longitude;
                    geolocationStatus.textContent = 'Ubicación activada ✅';
                    geolocationStatus.style.color = 'var(--geolocation-status-color)'; // Use theme color
                    console.log('User location:', userLat, userLng);
                },
                function(error) {
                    // Improved error logging
                    console.error('Error al obtener ubicación:', error);
                    let errorMessage = 'Ubicación no disponible ❌';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permiso de ubicación denegado 🚫';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Información de ubicación no disponible 📡';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Tiempo de espera agotado al obtener ubicación ⏰';
                            break;
                        case error.UNKNOWN_ERROR:
                            errorMessage = `Error desconocido: ${error.message || ''} ❓`;
                            break;
                    }
                    geolocationStatus.textContent = errorMessage;
                    geolocationStatus.style.color = 'var(--no-results-color)'; // Use error color
                },
                {
                    enableHighAccuracy: true, // Request high accuracy
                    timeout: 10000,          // 10 seconds timeout
                    maximumAge: 0            // No cached position
                }
            );
        } else {
            geolocationStatus.textContent = 'Geolocalización no soportada 🚫';
            geolocationStatus.style.color = 'var(--no-results-color)'; // Use error color
            console.warn('Navegador no soporta geolocalización');
        }
    }

    // Function to open Google Maps for directions
    function openGoogleMapsDirections(destinationLat, destinationLng) {
        const destinationQuery = `${destinationLat},${destinationLng}`;
        const googleMapsUrl = `https://www.google.es/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;
        window.open(googleMapsUrl, '_blank');
    }

    // Function to filter locations based on search input and current zone
    function filterLocations() {
        const searchTerm = addressSearchInput.value.trim().toLowerCase();
        let resultsFound = false;
        
        // Hide "Ubicaciones Destacadas" title and main map image always when filtering
        ubicacionesDestacadasTitle.style.display = 'none';
        mainMapImage.style.display = 'none';

        // Hide all location items and zone headings first
        allLocationItems.forEach(item => {
            item.style.display = 'none';
        });
        zoneHeadings.forEach(heading => {
            heading.style.display = 'none';
        });

        if (searchTerm === "") {
            // If search term is empty, show only items and heading for the currentZone
            ubicacionesDestacadasTitle.style.display = 'block'; // Show title when no search
            mainMapImage.style.display = 'block'; // Show map when no search

            zoneHeadings.forEach(heading => {
                if (heading.dataset.zone === currentZone) {
                    heading.style.display = 'block';
                }
            });
            allLocationItems.forEach(item => {
                if (item.dataset.zone === currentZone) {
                    item.style.display = 'block';
                    resultsFound = true; // Mark as found if items in current zone are shown
                }
            });

        } else {
            // Iterate through location items and show matches, and their zone heading
            allLocationItems.forEach(item => {
                const title = item.querySelector('h3').textContent.toLowerCase();
                
                // Use regex for whole word match or word start match
                const regex = new RegExp('\\b' + searchTerm, 'i'); 

                if (regex.test(title)) { // Only search in title using regex
                    item.style.display = 'block';
                    resultsFound = true;

                    // Find the preceding zone heading and display it
                    let previousSibling = item.previousElementSibling;
                    while (previousSibling) {
                        if (previousSibling.classList.contains('zone-heading')) {
                            previousSibling.style.display = 'block';
                            break; // Found the zone heading, stop
                        }
                        previousSibling = previousSibling.previousElementSibling;
                    }
                }
            });
        }

        if (resultsFound) {
            noResultsMessage.style.display = 'none';
        } else {
            noResultsMessage.style.display = 'block';
        }

        // Show/hide clear button based on input content
        if (searchTerm.length > 0) {
            clearSearchButton.style.display = 'block';
        } else {
            clearSearchButton.style.display = 'none';
        }

        // Scroll the main content container to the top to show results
        if (searchTerm !== "") { // Only scroll if a search term is present
            mainContentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        addressSearchInput.focus(); // Keep focus on the search input
    }

    // Function to toggle theme (day/night mode)
    function toggleTheme() {
        if (body.classList.contains('day-mode')) {
            body.classList.remove('day-mode');
            themeToggleButton.textContent = '🌙';
            localStorage.setItem('theme', 'night');
        } else {
            body.classList.add('day-mode');
            themeToggleButton.textContent = '☀️';
            localStorage.setItem('theme', 'day');
        }
    }

    // Event listener for the specific location buttons
    openMapsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const locationItem = this.closest('.location-item');
            const latitude = parseFloat(locationItem.getAttribute('data-lat'));
            const longitude = parseFloat(locationItem.getAttribute('data-lng'));

            if (!isNaN(latitude) && !isNaN(longitude)) {
                openGoogleMapsDirections(latitude, longitude); // Use new directions function
            } else {
                console.error('Error: Latitud o longitud no válidas para esta ubicación.');
            }
        });
    });

    // Event listener for the general address search button
    searchAddressButton.addEventListener('click', filterLocations);

    // Event listener for the clear search button
    clearSearchButton.addEventListener('click', function() {
        addressSearchInput.value = ''; // Clear the input
        filterLocations(); // Re-filter to show all items
    });

    // Allow filtering by pressing Enter in the input field
    addressSearchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            filterLocations();
        }
    });

    // Also filter as the user types and control clear button visibility
    addressSearchInput.addEventListener('input', filterLocations);

    // Event listener for theme toggle button
    themeToggleButton.addEventListener('click', toggleTheme);

    // Event listeners for zone buttons
    showZone1Button.addEventListener('click', () => {
        currentZone = '1';
        showZone1Button.classList.add('active');
        showZone2Button.classList.remove('active');
        filterLocations();
    });

    showZone2Button.addEventListener('click', () => {
        currentZone = '2';
        showZone2Button.classList.add('active');
        showZone1Button.classList.remove('active');
        filterLocations();
    });


    // Initial theme application on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'day') {
        body.classList.add('day-mode');
        themeToggleButton.textContent = '☀️';
    } else {
        // Default to night mode if no preference or preference is 'night'
        body.classList.remove('day-mode');
        themeToggleButton.textContent = '🌙';
    }

    // Request geolocation on page load
    requestGeolocation();

    // Initial filter call to ensure correct display on load (shows default zone)
    filterLocations();
});
