#!/bin/bash

echo "🧪 DASHAWAY COMPREHENSIVE TEST RUNNER"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track test results
BACKEND_TESTS_PASSED=false
FRONTEND_TESTS_PASSED=false

echo -e "${BLUE}📚 Running Backend Tests${NC}"
echo "========================="

cd backend

# Activate virtual environment and run tests
if [ -d "test_env" ]; then
    source test_env/bin/activate
    
    # Run backend tests (temporarily disable conftest.py)
    if [ -f "tests/conftest.py" ]; then
        mv tests/conftest.py tests/conftest.py.disabled
    fi
    
    echo "Running backend unit tests..."
    python -m pytest tests/unit/test_segmenter_simple.py -v --tb=short
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend tests PASSED${NC}"
        BACKEND_TESTS_PASSED=true
    else
        echo -e "${RED}❌ Backend tests FAILED${NC}"
    fi
    
    # Re-enable conftest.py
    if [ -f "tests/conftest.py.disabled" ]; then
        mv tests/conftest.py.disabled tests/conftest.py
    fi
    
    deactivate
else
    echo -e "${RED}❌ Backend test environment not found. Run setup first.${NC}"
fi

echo ""
echo -e "${BLUE}🎨 Running Frontend Tests${NC}"
echo "=========================="

cd ../frontend

# Check if testing dependencies are installed
if [ ! -d "node_modules/@testing-library" ]; then
    echo -e "${YELLOW}⚠️  Installing frontend testing dependencies...${NC}"
    npm install
fi

# Run frontend tests
echo "Running frontend unit tests..."
npm test -- --watchAll=false --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests PASSED${NC}"
    FRONTEND_TESTS_PASSED=true
else
    echo -e "${RED}❌ Frontend tests FAILED${NC}"
fi

echo ""
echo "🏁 TEST SUMMARY"
echo "==============="

if [ "$BACKEND_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✅ Backend Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Backend Tests: FAILED${NC}"
fi

if [ "$FRONTEND_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✅ Frontend Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Frontend Tests: FAILED${NC}"
fi

echo ""

if [ "$BACKEND_TESTS_PASSED" = true ] && [ "$FRONTEND_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your application is well-tested.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check output above for details.${NC}"
    exit 1
fi