#!/bin/bash

# X Company Attendance Management System Setup Script
# This script will set up the complete attendance management system

set -e

echo "🚀 X Company Attendance Management System Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_status "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_status "npm $(npm -v) is installed"
}

# Check if MongoDB is running
check_mongodb() {
    print_info "Using MongoDB Atlas cloud database"
    print_status "MongoDB Atlas connection configured"
}

# Install backend dependencies
setup_backend() {
    print_info "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file with MongoDB Atlas connection..."
        cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://pavanlebaka60:Lp@123456@cluster0.bvz3rtc.mongodb.net/attendance-system?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=x-company-attendance-system-super-secret-jwt-key-2024
JWT_EXPIRES_IN=24h

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@xcompany.com

# Logging Configuration
LOG_LEVEL=info
EOF
        print_status ".env file created with MongoDB Atlas connection"
    else
        print_status ".env file already exists"
        print_warning "Please ensure your .env file has the correct MongoDB Atlas connection string"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    cd ..
    print_status "Backend setup completed"
}

# Install frontend dependencies
setup_frontend() {
    print_info "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file..."
        echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
        print_status ".env file created"
    else
        print_status ".env file already exists"
    fi
    
    cd ..
    print_status "Frontend setup completed"
}

# Create default admin user
create_admin() {
    print_info "Creating default admin user..."
    
    cd backend
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_error ".env file not found. Please run setup first."
        exit 1
    fi
    
    # Start server in background
    print_info "Starting server to create admin user..."
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Create admin user
    print_info "Creating default admin user..."
    curl -X POST http://localhost:5000/api/auth/create-admin \
        -H "Content-Type: application/json" \
        -d '{}' || print_warning "Failed to create admin user. You can create it manually later."
    
    # Stop server
    kill $SERVER_PID 2>/dev/null || true
    
    cd ..
    print_status "Admin user creation completed"
}

# Build frontend for production
build_frontend() {
    print_info "Building frontend for production..."
    
    cd frontend
    npm run build
    cd ..
    
    print_status "Frontend build completed"
}

# Start development servers
start_dev() {
    print_info "Starting development servers..."
    
    # Start backend
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    print_status "Development servers started"
    print_info "Backend: http://localhost:5000"
    print_info "Frontend: http://localhost:3000"
    print_info "Press Ctrl+C to stop servers"
    
    # Wait for user to stop
    wait
}

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  setup     - Complete setup (install dependencies, create config files)"
    echo "  install   - Install dependencies only"
    echo "  admin     - Create default admin user"
    echo "  build     - Build frontend for production"
    echo "  dev       - Start development servers"
    echo "  check     - Check system requirements"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # Complete setup"
    echo "  $0 dev      # Start development servers"
    echo "  $0 check    # Check system requirements"
}

# Main script logic
case "${1:-setup}" in
    "setup")
        print_info "Starting complete setup..."
        check_node
        check_npm
        check_mongodb
        setup_backend
        setup_frontend
        create_admin
        print_status "Setup completed successfully!"
        print_info "You can now run: $0 dev"
        ;;
    "install")
        print_info "Installing dependencies..."
        setup_backend
        setup_frontend
        print_status "Dependencies installed successfully!"
        ;;
    "admin")
        create_admin
        ;;
    "build")
        build_frontend
        ;;
    "dev")
        start_dev
        ;;
    "check")
        print_info "Checking system requirements..."
        check_node
        check_npm
        check_mongodb
        print_status "System requirements check completed!"
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac 