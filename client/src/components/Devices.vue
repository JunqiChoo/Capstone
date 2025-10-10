<template>
    <div class="map-container">
        <!-- Side Panel -->
        <div class="side-panel">
            <h2 class="text-bold">DEVICES</h2>
            <ul>
                <!-- Device list -->
                <li v-for="device in devices" :key="device.id">
                    <div>
                        <strong>{{ device.deviceName }}</strong>
                        <span
                            :class="['status-circle', device.status === 'ok' ? 'status-ok' : 'status-offline']"></span><br>
                        <strong>Last Seen:</strong> {{ new Date(device.lastSeen).toLocaleString() }}<br>
                    </div>
                </li>
            </ul>

            <!-- Back Button -->
            <button @click="clickBack" class="back-btn"><i class="bi bi-arrow-left"></i> Back</button>
        </div>

        <!-- Map Container -->
        <div ref="mapContainer" class="map"></div>
    </div>
</template>

<script setup>
import maplibre, { NavigationControl } from 'maplibre-gl'; // Import NavigationControl
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { nextTick } from 'vue';

const router = useRouter();
const mapContainer = ref(null); // Create a reference to the map container
const devices = ref([]); // Array to store device data
let map = null; // Declare a variable to hold the map instance

// Fetch device data from the API
const GetDevicesData = async () => {
    try {
        const res = await axios.get('http://localhost:3000/api/getDevices');
        devices.value = res.data; // Populate devices array with API response
        console.log(devices.value); // Log the device data to check
    } catch (error) {
        console.error('Error fetching devices:', error);
    }
};

// Function for the back button
const clickBack = () => {
    console.log('Back button clicked');
    router.push("/DashBoard");
};

// Get the latitude and longitude based on postal code
const getLatLngFromPostal = async (postalCode) => {
    try {
        const response = await axios.get(
            `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y`
        );
        console.log("HITTTTTTTTONEMAPs");
        console.log(response);

        // Return the latitude and longitude of the first result
        if (response.data && response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            return {
                latitude: parseFloat(result.LATITUDE),
                longitude: parseFloat(result.LONGITUDE),
            };
        } else {
            throw new Error('No results found for postal code');
        }
    } catch (error) {
        console.error('Error fetching lat/lng:', error);
        return null;
    }
};

// Fetch device data and initialize the map once the data is available
onMounted(async () => {
    await GetDevicesData(); // Ensure devices data is fetched first
    await initMap(); // Initialize the map after devices data is loaded
    await plotDeviceMarkers(); // Plot markers after data is available
});

// Function to initialize the map
const initMap = async () => {
    // Initialize the map and assign it to the global 'map' variable
    map = new maplibre.Map({
        container: mapContainer.value,
        style: 'http://localhost:8080/styles/basic-preview/style.json', // URL to the style JSON
        center: [103.8198, 1.3521], // Singapore central coordinates
        zoom: 15,
    });

    map.addControl(new NavigationControl(), 'top-right');

    map.on('load', () => {
        map.resize();
        // Ensure mapContainer.value is available
        nextTick(() => {
            if (mapContainer.value) {
                mapContainer.value.classList.add('ready');
            }
        });
    });

    const singaporeBounds = [
        [103.6, 1.22],
        [104.05, 1.48],
    ];

    map.fitBounds(singaporeBounds);
};

// Function to plot markers for each device
const plotDeviceMarkers = async () => {
    // Ensure the map is initialized before plotting
    if (!map) {
        console.error('Map is not initialized');
        return;
    }

    // Loop through devices and fetch their lat/lng based on the postal code
    for (const device of devices.value) {
        const latLng = await getLatLngFromPostal(device.postalCode);
        console.log("INSIDE PLOT");
        console.log(latLng);

        // Ensure latLng is valid before creating the marker
        
            // Create a marker for each device
            new maplibre.Marker()
                .setLngLat([latLng.longitude, latLng.latitude])
                .setPopup(new maplibre.Popup().setHTML(`<strong>${device.deviceName}</strong>`))
                .addTo(map);
        
    }
};
</script>

<style scoped>
.map-container {
    position: relative;
    height: 100vh;
    /* Full screen height */
    width: 100%;
}

.map {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.side-panel {
    position: absolute;
    top: 5%;
    left: 1%;
    width: 300px;
    /* Adjust width as needed */
    height: 80%;
    background-color: rgba(255, 255, 255, 0.9);
    /* Semi-transparent background */
    padding: 15px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    overflow-y: auto;
    /* Scrollable content */
    z-index: 10;
    border-radius: 15px;
    /* Add this for rounded corners */
}

.side-panel h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.side-panel ul {
    list-style-type: none;
    padding-left: 0;
}

.side-panel li {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    transition: background-color 0.3s;
}

.side-panel li:hover {
    background-color: #f4f4f4;
}

/* Back Button Styling */
.back-btn {
    position: absolute;
    bottom: 15px;
    /* Position the button at the bottom */
    left: 15px;
    /* Align it to the left */
    background-color: #4d5053;
    /* Blue color */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease;
}

.status-circle {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-left: 10px;
    border-radius: 50%;
    background-color: red;
    /* Default red circle */
}

.status-ok {
    background-color: green;
    /* Green circle when status is 'ok' */
}

.status-offline {
    background-color: red;
    /* Red circle when status is not 'ok' */
}
</style>
