# Artist Performance Location Tracker

A full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js) that allows artists to manage their upcoming performance schedules and enables fans to discover, view on an interactive map, and book upcoming events.

## Features

* **Role-Based Access**: Secure authentication mechanism differentiating between 'Artist' and 'Fan' users using JSON Web Tokens (JWT).
* **Event Management for Artists**:
  * Create, update, and delete events.
  * Inputs are automatically geocoded (using a geocoding service like Node-Geocoder) into geographical coordinates.
  * Events are stored in MongoDB utilizing GeoJSON points for advanced spatial querying.
* **Discovery for Fans**:
  * Fans can browse upcoming events on a modern, interactive map built with `react-map-gl` and Mapbox.
  * Synchronized map movements when interacting with the event list.
* **Booking System**: Fans can reserve and book tickets for upcoming events, saving them to their profiles.
* **Input Validation & Data Integrity**: Backend schema validation and avoidance of duplicate events.
* **Premium UI**: Styled with Tailwind CSS to provide a clean, responsive, and dynamic user experience, complete with Lucide-React icons and glassmorphic elements.

## Tech Stack

### Frontend
- **React.js** (Bootstrapped with Vite)
- **Tailwind CSS** for utility-first styling
- **React Router DOM** for client-side routing
- **React Map GL (Mapbox)** for interactive maps
- **Axios** for HTTP requests

### Backend
- **Node.js & Express.js** for robust API development
- **MongoDB & Mongoose** for the NoSQL database and schema modeling
- **JWT & BcryptJS** for authentication and password hashing
- **Node-Geocoder** for server-side address-to-coordinate conversions

---

## Getting Started

### Prerequisites

Make sure you have the following installed to run this project:
- [Node.js](https://nodejs.org/)
- A [MongoDB](https://www.mongodb.com/) instance (either local or MongoDB Atlas)
- Configuration keys for Mapbox (frontend) and a Geocoding Provider (e.g. MapQuest API key for the backend)

### Installation & Setup

1. **Navigate to the core project directory**:
   ```bash
   cd artist-tracker
   ```

2. **Backend Setup**:
   Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and add the necessary environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEOCODER_PROVIDER=mapquest
   GEOCODER_API_KEY=your_geocoder_api_key
   ```
   Start the backend server:
   ```bash
   node server.js
   # Or use nodemon for auto-restarts on changes
   # nodemon server.js
   ```

3. **Frontend Setup**:
   Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory and define your variables:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage Flow

1. **Sign Up / Sign In**: Register an account as either an `artist` or a `fan`.
2. **Artist Workflow**: Log in using an Artist account, maneuver to the "Studio / Dashboard," and start registering new events with valid addresses. 
3. **Fan Workflow**: Log in as a Fan to be directed to the main portal map. Browse geographic markers matching event coordinates, see performance details, and tap "Book Ticket" to reserve your spot!

## License

This project is licensed under the ISC License.
