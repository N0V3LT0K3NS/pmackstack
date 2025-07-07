#!/bin/bash

echo "🧪 PMackStack Migration Test Suite"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default test database URL
TEST_DATABASE_URL=${TEST_DATABASE_URL:-"postgresql://localhost:5432/pmackstack_test"}
TEST_API_URL=${TEST_API_URL:-"http://localhost:3002"}

echo "📋 Test Configuration:"
echo "  Database: $TEST_DATABASE_URL"
echo "  API URL: $TEST_API_URL"
echo ""

# Function to run a test and check result
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}🔄 Running $test_name...${NC}"
    
    if eval $test_command; then
        echo -e "${GREEN}✅ $test_name PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name FAILED${NC}"
        return 1
    fi
}

# Test 1: Database Migration Verification
echo "🗄️  Testing Database Migration..."
echo "================================="
if ! run_test "Database Migration Verification" "TEST_DATABASE_URL='$TEST_DATABASE_URL' node scripts/verify-migration.js"; then
    echo -e "${RED}❌ Database migration verification failed!${NC}"
    echo "💡 Please check the migration script and database connection."
    exit 1
fi
echo ""

# Test 2: Login Authentication Tests
echo "🔐 Testing Login Authentication..."
echo "================================="
if ! run_test "Login Authentication Tests" "TEST_API_URL='$TEST_API_URL' node scripts/test-logins.js"; then
    echo -e "${RED}❌ Login authentication tests failed!${NC}"
    echo "💡 Please check the server is running and migration was successful."
    exit 1
fi
echo ""

# Overall Summary
echo "🎉 All Tests Completed Successfully!"
echo "===================================="
echo ""
echo -e "${GREEN}✅ Database migration verified${NC}"
echo -e "${GREEN}✅ User authentication working${NC}"
echo -e "${GREEN}✅ Store permissions configured${NC}"
echo ""
echo "🚀 Migration is ready for production deployment!"
echo ""
echo "📋 Next Steps:"
echo "  1. Review test results above"
echo "  2. Test frontend manually at: http://localhost:3000"
echo "  3. If everything works, deploy to production"
echo "  4. Run the same tests against production after deployment" 