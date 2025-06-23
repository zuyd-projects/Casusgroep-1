#!/bin/bash

# Backend API Testing Script
# This script runs the unit tests and basic integration tests locally

set -e

echo "🚀 Starting Backend API Tests..."

# Navigate to backend directory
cd "$(dirname "$0")/../backend/ERPNumber1"

echo "📦 Restoring dependencies..."
dotnet restore --verbosity quiet

echo "🔨 Building project..."
dotnet build --configuration Release --verbosity quiet --no-restore

echo "🧪 Running unit tests..."
dotnet test --configuration Release --verbosity normal --no-build \
    --collect:"XPlat Code Coverage" --results-directory ./TestResults \
    --logger "trx;LogFileName=test-results.trx"

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    
    # Show coverage files if generated
    if [ -d "./TestResults" ]; then
        echo "📊 Test results and coverage saved to:"
        find ./TestResults -name "*.trx" -o -name "*.xml" | head -5
    fi
else
    echo "❌ Some tests failed!"
    exit 1
fi

echo ""
echo "🎉 Backend testing complete!"
echo "💡 To run specific tests:"
echo "   dotnet test --filter \"Unit\" --verbosity normal"
echo "   dotnet test --filter \"SimpleProductsTest\" --verbosity normal"
