#!/bin/bash

# Simple test runner for the ERPNumber1.Tests project
# Run this from the test project directory

set -e

echo "🧪 Running ERPNumber1 Tests..."

# Check if we're in the right directory
if [ ! -f "ERPNumber1.Tests.csproj" ]; then
    echo "❌ Error: ERPNumber1.Tests.csproj not found"
    echo "   Please run this script from the ERPNumber1.Tests directory"
    exit 1
fi

echo "📦 Restoring packages..."
dotnet restore --verbosity quiet

echo "🔨 Building test project..."
dotnet build --configuration Release --verbosity quiet --no-restore

echo "🧪 Running tests..."
dotnet test --configuration Release --verbosity normal --no-build

echo "✅ Tests completed!"

# Show available test filters
echo ""
echo "💡 Available test filters:"
echo "   dotnet test --filter \"Unit\"           # Run only unit tests"
echo "   dotnet test --filter \"Simple\"         # Run only simple tests"
echo "   dotnet test --filter \"Products\"       # Run only product-related tests"
echo "   dotnet test --filter \"Order\"          # Run only order-related tests"
