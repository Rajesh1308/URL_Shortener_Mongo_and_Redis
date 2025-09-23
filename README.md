# URL Shortener Application

A full-stack URL shortener application built with **Express, Node.js, MongoDB, React, Redis, BullMQ, and Docker**. The application allows users to create, manage, and track shortened URLs efficiently, leveraging caching and background queues for performance and scalability.

---

## Features

- **User Management:** JWT-based authentication for secure login and registration.
- **Dashboard:** Create, update, and delete short URLs with custom aliases.
- **Redirects:** Fast URL redirection using **Redis caching** (3x faster retrieval: 600ms → 200ms).
- **Click Analytics:** Tracks URL clicks asynchronously using **BullMQ queues** and stores data in MongoDB.
- **Dockerized:** Entire application runs seamlessly using Docker.

---

## Functionality

1. **User Authentication**
   - Secure signup and login with JWT.
   - Access to a personal dashboard after login.

2. **URL Management**
   - Create short URLs with optional custom aliases.
   - Update destination URLs for existing short URLs.
   - Delete URLs from the dashboard.

3. **Optimized URL Redirects**
   - Uses Redis for caching redirect URLs for faster response times.
   - Retrieves URLs efficiently to handle high traffic.

4. **Click Tracking**
   - All clicks are logged asynchronously using BullMQ queues.
   - Click data is persisted in MongoDB for analytics.

---

## Running Locally

The application is fully dockerized. To run it locally, install docker desktop and simply execute:

```bash
docker compose up
