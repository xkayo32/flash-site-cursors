#!/bin/bash

# StudyPro Server Startup Script
# Server IP: 173.208.151.106

echo "🚀 Starting StudyPro Server"
echo "📍 Server IP: 173.208.151.106"
echo ""

# Change to project directory
cd /home/administrator/flash-site-cursors

# Start services with docker compose
docker compose up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🌐 Access points:"
echo "   Frontend:    http://173.208.151.106:5273"
echo "   Backend API: http://173.208.151.106:8180"
echo "   phpMyAdmin:  http://173.208.151.106:8280"
echo ""
echo "📊 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"
