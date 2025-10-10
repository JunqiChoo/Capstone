# Smart Cafeteria Tray Return & Food Waste Tracker

This project is a Final Year Project (FYP) focused on promoting
sustainability and reducing food waste at SIT's Punggol Campus. The
system integrates **hardware, AI, and software** to automatically detect
food waste, track tray returns, and provide analytics for cafeteria
management.

## 🔹 Project Overview

-   **Hardware**: Raspberry Pi 4, Pi Camera Module 3 (NoIR), HX711 load
    cell sensors, IR sensors.
-   **AI**: YOLOv8/MobileNet for real-time classification of leftover
    food (rice, meat, vegetables).
-   **Software**: Vue.js + Node.js + MongoDB stack for data collection,
    dashboard visualization, and analytics.

## 🔹 Key Features

-   Automatic tray detection with IR sensors.
-   Real-time image capture of leftover food.
-   AI-based classification of food types and waste detection.
-   Weight measurement via load cell sensors.
-   Data storage in MongoDB with structured schema (user ID, timestamp,
    weight, food categories, image path).
-   Waste analytics dashboard with heatmaps and trend predictions.
-   Alignment with **SG Green Plan 2030** sustainability goals.

## 🔹 System Flow

1.  IR sensor detects when a user places a tray.\
2.  Camera captures an image of the leftover food.\
3.  AI model classifies food categories and estimates waste.\
4.  Weight sensors measure the amount of food discarded.\
5.  Data (image + weight + breakdown) is sent to MongoDB.\
6.  Dashboard visualizes waste statistics for cafeteria staff and
    management.
<img width="667" height="652" alt="image" src="https://github.com/user-attachments/assets/07b031d7-9204-4c57-86f3-51a0de04bbef" />

## 🔹 Tech Stack

-   **Frontend**: Vue.js\
-   **Backend**: Node.js + Express\
-   **Database**: MongoDB\
-   **AI Model**: YOLOv8 / MobileNet\
-   **Hardware**: Raspberry Pi 4, Pi Camera, HX711 load cell sensors, IR
    sensors

## 🔹 Expected Impact

-   Encourage higher tray return rates.
-   Provide insights into food waste patterns.
-   Support sustainability reporting and planning.
-   Educate students on environmental impact.

------------------------------------------------------------------------

<img width="1286" height="794" alt="image" src="https://github.com/user-attachments/assets/2d6713f5-f04e-4449-a57a-e4685eb9c949" />
<img width="1281" height="425" alt="image" src="https://github.com/user-attachments/assets/919fe1ca-6d0a-483b-93ec-5dd249661c66" />
