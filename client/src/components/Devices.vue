<template>
    <div class="map-container">
        <!-- Side Panel -->
        <div class="side-panel">
            <h2 class="text-bold">DEVICES</h2>
            <ul>
                <!-- Device list -->
                <li v-for="device in devices" :key="device.id" @click="ClickSpecificDevice(device.postalCode)">
                    <div>
                        <strong>{{ device.deviceName }}</strong>
                        <span
                            :class="['status-circle', device.status === 'ok' ? 'status-ok' : 'status-offline']"></span><br>
                        <strong>Postal:</strong> {{ device.postalCode }}<br>
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
import maplibre, { NavigationControl } from 'maplibre-gl';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification'
const toast = useToast()


const router = useRouter();
const mapContainer = ref(null);
const devices = ref([]);
let map = null;

// Fetch device data from the API
const GetDevicesData = async () => {
    try {
        const res = await axios.get('http://localhost:3000/api/getDevices');
        devices.value = res.data;
        console.log('📱 Devices data:', devices.value);
        return devices.value;
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};




const ClickSpecificDevice = async (postalCode) => {
    const latLng = await getLatLngFromPostal(postalCode);
    if (latLng) {
        map.flyTo({
            center: [latLng.longitude, latLng.latitude],
            zoom: 16,  // Set the zoom level for a closer view
            duration: 2000,  // Smooth animation duration in milliseconds
            essential: true  // Ensure that this flight is part of the map's essential flow
        });
    } else {
        console.error('❌ Coordinates not found for postal code:', postalCode);
    }
};



const clickBack = () => {
    router.push("/DashBoard");
};

// Get the latitude and longitude based on postal code
const getLatLngFromPostal = async (postalCode) => {


    try {
        console.log(`📍 Fetching coordinates for postal code: ${postalCode}`);
        
        const response = await axios.get(
            `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y`
        );
        
        if (response.data && response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            console.log(`📄 OneMap result for ${postalCode}:`, result);
            
            const latitude = parseFloat(result.LATITUDE);
            const longitude = parseFloat(result.LONGITUDE);
            
            if (!isNaN(latitude) && !isNaN(longitude)) {
                console.log(`✅ Coordinates found: ${latitude}, ${longitude}`);
                return { latitude, longitude };
            }
        }
        
        console.warn(`❌ No coordinates found for postal code: ${postalCode}`);
        return null;
    } catch (error) {
        console.error('Error fetching lat/lng:', error);
        return null;
    }
};

// Initialize map
const initMap = () => {
    return new Promise((resolve) => {
        console.log('🗺️ Initializing map...');
        console.log('📦 Map container:', mapContainer.value);
        
        if (!mapContainer.value) {
            console.error('❌ Map container is null!');
            return;
        }

        map = new maplibre.Map({
            container: mapContainer.value,
            style: 'http://localhost:8080/styles/basic-preview/style.json',
            center: [103.8198, 1.3521],
            zoom: 11,
        });

        map.addControl(new NavigationControl(), 'top-right');

        // Wait for map to load completely
        map.on('load', () => {
            console.log('✅ Map loaded successfully');
            map.resize();
            resolve();
        });

        map.on('error', (e) => {
            console.error('❌ Map error:', e);
        });

        // Set Singapore bounds
        const singaporeBounds = [
            [103.6, 1.22],
            [104.05, 1.48],
        ];
        map.fitBounds(singaporeBounds);
    });
};

// Function to plot markers
const plotDeviceMarkers = async () => {
    if (!map) return;

    const features = [];

    for (const device of devices.value) {
        const latLng = await getLatLngFromPostal(device.postalCode);
        if (latLng) {
            // Determine color based on device status
            let markerColor = '#FF0000'; // Default to red (offline)
            if (device.status === 'ok') {
                markerColor =   '#198754' ;  // Green for 'ok' (active)
            } else if (device.status === 'offline') {
                markerColor = '#FF0000';  // Red for 'offline'
            } else {
                markerColor = '#FFFF00';  // Yellow for any other status (e.g., 'warning', 'error', etc.)
            }

            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [Number(latLng.longitude), Number(latLng.latitude)],
                },
                properties: {
                    title: device.deviceName,
                    status: device.status,
                },
            });

            // Add source and layer to map
            if (!map.getSource('devices')) {
                map.addSource('devices', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: features,
                    },
                });

                map.addLayer({
                    id: 'devices',
                    type: 'circle',
                    source: 'devices',
                    paint: {
                        'circle-radius': 8,
                        'circle-color': markerColor,  // Dynamic color based on status
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#FFFFFF',
                    },
                });
            } else {
                map.getSource('devices').setData({
                    type: 'FeatureCollection',
                    features: features,
                });
            }
        }
    }
};
// Main initialization
onMounted(async () => {
    console.log('🚀 Component mounted');
    
    try {
        // Step 1: Wait for DOM to be fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Step 2: Fetch devices
        const devicesData = await GetDevicesData();
        
        if (devicesData.length === 0) {
            console.error('❌ No devices found!');
            return;
        }

        // Step 3: Initialize map
        await initMap();
        
        // Step 4: Wait a bit more for map to be fully ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 5: Plot markers
        await plotDeviceMarkers();
        
    } catch (error) {
        console.error('💥 Initialization error:', error);
    }

     
});
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
    z-index: 1; /* Ensure map has proper z-index */
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

.white-toast {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}




</style>
