#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Rocket Company Website
Tests all API endpoints including authentication, CRUD operations, and data integrity
"""

import requests
import json
import time
import sys
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://bf10fccb-49db-454b-973f-28aec153f6cb.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, auth_required=False):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if auth_required and self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_basic_api(self):
        """Test GET /api/ endpoint"""
        print("\n=== Testing Basic API Endpoint ===")
        
        response = self.make_request("GET", "/")
        if response is None:
            self.log_result("Basic API", False, "Failed to connect to API endpoint")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "message" in data and "AstroLaunch API" in data["message"]:
                    self.log_result("Basic API", True, "API endpoint responding correctly")
                    return True
                else:
                    self.log_result("Basic API", False, "Unexpected response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Basic API", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Basic API", False, f"HTTP {response.status_code}", response.text)
            return False
    
    def test_user_registration(self):
        """Test POST /api/auth/register"""
        print("\n=== Testing User Registration ===")
        
        # Test successful registration
        user_data = {
            "name": "Sarah Johnson",
            "email": f"sarah.johnson.{int(time.time())}@astrolaunch.com",
            "password": "SecurePass123!"
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        if response is None:
            self.log_result("User Registration", False, "Failed to connect to registration endpoint")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "user" in data and "token" in data:
                    # Verify user data structure
                    user = data["user"]
                    if all(key in user for key in ["id", "name", "email", "role"]):
                        # Verify no password in response
                        if "password" not in user:
                            self.auth_token = data["token"]  # Store token for later tests
                            self.log_result("User Registration", True, "User registered successfully with proper data structure")
                            
                            # Test duplicate registration
                            dup_response = self.make_request("POST", "/auth/register", user_data)
                            if dup_response.status_code == 400:
                                self.log_result("Duplicate Registration Prevention", True, "Duplicate registration properly rejected")
                            else:
                                self.log_result("Duplicate Registration Prevention", False, "Duplicate registration not properly handled")
                            
                            return True
                        else:
                            self.log_result("User Registration", False, "Password exposed in response")
                            return False
                    else:
                        self.log_result("User Registration", False, "Missing required user fields", user)
                        return False
                else:
                    self.log_result("User Registration", False, "Missing user or token in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("User Registration", False, "Invalid JSON response")
                return False
        else:
            self.log_result("User Registration", False, f"HTTP {response.status_code}", response.text)
            return False
    
    def test_user_login(self):
        """Test POST /api/auth/login"""
        print("\n=== Testing User Login ===")
        
        # First register a user for login testing
        user_data = {
            "name": "Marcus Rodriguez",
            "email": f"marcus.rodriguez.{int(time.time())}@astrolaunch.com",
            "password": "LoginTest456!"
        }
        
        reg_response = self.make_request("POST", "/auth/register", user_data)
        if reg_response is None or reg_response.status_code != 200:
            self.log_result("User Login Setup", False, "Failed to register test user for login")
            return False
        
        # Test successful login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response is None:
            self.log_result("User Login", False, "Failed to connect to login endpoint")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "user" in data and "token" in data:
                    user = data["user"]
                    if "password" not in user and user["email"] == login_data["email"]:
                        self.auth_token = data["token"]  # Update token
                        self.log_result("User Login", True, "User login successful with proper data structure")
                        
                        # Test invalid credentials
                        invalid_login = {
                            "email": user_data["email"],
                            "password": "wrongpassword"
                        }
                        invalid_response = self.make_request("POST", "/auth/login", invalid_login)
                        if invalid_response.status_code == 401:
                            self.log_result("Invalid Login Prevention", True, "Invalid credentials properly rejected")
                        else:
                            self.log_result("Invalid Login Prevention", False, "Invalid credentials not properly handled")
                        
                        return True
                    else:
                        self.log_result("User Login", False, "Invalid user data in response", user)
                        return False
                else:
                    self.log_result("User Login", False, "Missing user or token in response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("User Login", False, "Invalid JSON response")
                return False
        else:
            self.log_result("User Login", False, f"HTTP {response.status_code}", response.text)
            return False
    
    def test_token_verification(self):
        """Test GET /api/auth/verify"""
        print("\n=== Testing Token Verification ===")
        
        if not self.auth_token:
            self.log_result("Token Verification", False, "No auth token available for testing")
            return False
        
        response = self.make_request("GET", "/auth/verify", auth_required=True)
        if response is None:
            self.log_result("Token Verification", False, "Failed to connect to verify endpoint")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("valid") is True and "user" in data:
                    user = data["user"]
                    if "password" not in user:
                        self.log_result("Token Verification", True, "Token verification successful")
                        
                        # Test invalid token
                        old_token = self.auth_token
                        self.auth_token = "invalid_token"
                        invalid_response = self.make_request("GET", "/auth/verify", auth_required=True)
                        self.auth_token = old_token  # Restore valid token
                        
                        if invalid_response.status_code == 401:
                            self.log_result("Invalid Token Rejection", True, "Invalid token properly rejected")
                        else:
                            self.log_result("Invalid Token Rejection", False, "Invalid token not properly handled")
                        
                        return True
                    else:
                        self.log_result("Token Verification", False, "Password exposed in verification response")
                        return False
                else:
                    self.log_result("Token Verification", False, "Invalid verification response", data)
                    return False
            except json.JSONDecodeError:
                self.log_result("Token Verification", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Token Verification", False, f"HTTP {response.status_code}", response.text)
            return False
    
    def test_rockets_crud(self):
        """Test GET /api/rockets and POST /api/rockets"""
        print("\n=== Testing Rockets CRUD Operations ===")
        
        # Test GET rockets
        response = self.make_request("GET", "/rockets")
        if response is None:
            self.log_result("Get Rockets", False, "Failed to connect to rockets endpoint")
            return False
        
        if response.status_code == 200:
            try:
                rockets = response.json()
                if isinstance(rockets, list):
                    # Verify sample data initialization
                    if len(rockets) >= 3:  # Should have sample rockets
                        # Check data structure
                        rocket = rockets[0]
                        required_fields = ["id", "name", "type", "specifications", "status", "createdAt"]
                        if all(field in rocket for field in required_fields):
                            # Verify no MongoDB _id field
                            if "_id" not in rocket:
                                self.log_result("Get Rockets", True, f"Retrieved {len(rockets)} rockets with proper structure")
                            else:
                                self.log_result("Get Rockets", False, "MongoDB _id field exposed in response")
                                return False
                        else:
                            self.log_result("Get Rockets", False, "Missing required fields in rocket data", rocket)
                            return False
                    else:
                        self.log_result("Get Rockets", False, "Sample data not properly initialized")
                        return False
                else:
                    self.log_result("Get Rockets", False, "Invalid response format - expected array", rockets)
                    return False
            except json.JSONDecodeError:
                self.log_result("Get Rockets", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Get Rockets", False, f"HTTP {response.status_code}", response.text)
            return False
        
        # Test POST rockets (requires authentication)
        if not self.auth_token:
            self.log_result("Create Rocket", False, "No auth token available for testing")
            return False
        
        new_rocket = {
            "name": "Titan X",
            "type": "Medium-lift launch vehicle",
            "specifications": {
                "height": "85 m",
                "diameter": "10 m",
                "mass": "800,000 kg",
                "payloadToLEO": "45,000 kg"
            },
            "status": "development"
        }
        
        response = self.make_request("POST", "/rockets", new_rocket, auth_required=True)
        if response is None:
            self.log_result("Create Rocket", False, "Failed to connect to create rocket endpoint")
            return False
        
        if response.status_code == 201:
            try:
                created_rocket = response.json()
                if "id" in created_rocket and created_rocket["name"] == new_rocket["name"]:
                    if "_id" not in created_rocket:
                        self.log_result("Create Rocket", True, "Rocket created successfully with proper structure")
                        return True
                    else:
                        self.log_result("Create Rocket", False, "MongoDB _id field exposed in create response")
                        return False
                else:
                    self.log_result("Create Rocket", False, "Invalid created rocket data", created_rocket)
                    return False
            except json.JSONDecodeError:
                self.log_result("Create Rocket", False, "Invalid JSON response")
                return False
        elif response.status_code == 401:
            self.log_result("Create Rocket", False, "Authentication failed for rocket creation")
            return False
        else:
            self.log_result("Create Rocket", False, f"HTTP {response.status_code}", response.text)
            return False
    
    def test_missions_crud(self):
        """Test GET /api/missions and POST /api/missions"""
        print("\n=== Testing Missions CRUD Operations ===")
        
        # Test GET missions
        response = self.make_request("GET", "/missions")
        if response is None:
            self.log_result("Get Missions", False, "Failed to connect to missions endpoint")
            return False
        
        if response.status_code == 200:
            try:
                missions = response.json()
                if isinstance(missions, list) and len(missions) >= 3:
                    mission = missions[0]
                    required_fields = ["id", "name", "description", "status", "launchDate", "payload", "orbit", "customer", "createdAt"]
                    if all(field in mission for field in required_fields) and "_id" not in mission:
                        self.log_result("Get Missions", True, f"Retrieved {len(missions)} missions with proper structure")
                    else:
                        self.log_result("Get Missions", False, "Invalid mission data structure", mission)
                        return False
                else:
                    self.log_result("Get Missions", False, "Invalid missions response or insufficient sample data")
                    return False
            except json.JSONDecodeError:
                self.log_result("Get Missions", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Get Missions", False, f"HTTP {response.status_code}", response.text)
            return False
        
        # Test POST missions (requires authentication)
        if not self.auth_token:
            self.log_result("Create Mission", False, "No auth token available for testing")
            return False
        
        new_mission = {
            "name": "Europa Explorer",
            "description": "Scientific mission to explore Jupiter's moon Europa",
            "status": "planned",
            "launchDate": "2025-06-15T10:30:00Z",
            "payload": "Europa Lander",
            "orbit": "Jupiter system",
            "customer": "ESA"
        }
        
        response = self.make_request("POST", "/missions", new_mission, auth_required=True)
        if response is None:
            self.log_result("Create Mission", False, "Failed to connect to create mission endpoint")
            return False
        
        if response.status_code == 201:
            try:
                created_mission = response.json()
                if "id" in created_mission and created_mission["name"] == new_mission["name"] and "_id" not in created_mission:
                    self.log_result("Create Mission", True, "Mission created successfully with proper structure")
                    return True
                else:
                    self.log_result("Create Mission", False, "Invalid created mission data", created_mission)
                    return False
            except json.JSONDecodeError:
                self.log_result("Create Mission", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Create Mission", False, f"HTTP {response.status_code}", response.text)
            return False
    
    def test_teams_crud(self):
        """Test GET /api/teams and POST /api/teams"""
        print("\n=== Testing Teams CRUD Operations ===")
        
        # Test GET teams
        response = self.make_request("GET", "/teams")
        if response is None:
            self.log_result("Get Teams", False, "Failed to connect to teams endpoint")
            return False
        
        if response.status_code == 200:
            try:
                teams = response.json()
                if isinstance(teams, list) and len(teams) >= 4:
                    team_member = teams[0]
                    required_fields = ["id", "name", "position", "department", "bio", "experience", "createdAt"]
                    if all(field in team_member for field in required_fields) and "_id" not in team_member:
                        self.log_result("Get Teams", True, f"Retrieved {len(teams)} team members with proper structure")
                    else:
                        self.log_result("Get Teams", False, "Invalid team member data structure", team_member)
                        return False
                else:
                    self.log_result("Get Teams", False, "Invalid teams response or insufficient sample data")
                    return False
            except json.JSONDecodeError:
                self.log_result("Get Teams", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Get Teams", False, f"HTTP {response.status_code}", response.text)
            return False
        
        # Test POST teams (requires authentication)
        if not self.auth_token:
            self.log_result("Create Team Member", False, "No auth token available for testing")
            return False
        
        new_team_member = {
            "name": "Dr. Alex Chen",
            "position": "Propulsion Engineer",
            "department": "Engineering",
            "bio": "Specialist in advanced rocket propulsion systems and fuel efficiency optimization.",
            "experience": "7 years"
        }
        
        response = self.make_request("POST", "/teams", new_team_member, auth_required=True)
        if response is None:
            self.log_result("Create Team Member", False, "Failed to connect to create team member endpoint")
            return False
        
        if response.status_code == 201:
            try:
                created_member = response.json()
                if "id" in created_member and created_member["name"] == new_team_member["name"] and "_id" not in created_member:
                    self.log_result("Create Team Member", True, "Team member created successfully with proper structure")
                    return True
                else:
                    self.log_result("Create Team Member", False, "Invalid created team member data", created_member)
                    return False
            except json.JSONDecodeError:
                self.log_result("Create Team Member", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Create Team Member", False, f"HTTP {response.status_code}", response.text)
            return False
    
    def test_schedules_crud(self):
        """Test GET /api/schedules and POST /api/schedules"""
        print("\n=== Testing Schedules CRUD Operations ===")
        
        # Test GET schedules
        response = self.make_request("GET", "/schedules")
        if response is None:
            self.log_result("Get Schedules", False, "Failed to connect to schedules endpoint")
            return False
        
        if response.status_code == 200:
            try:
                schedules = response.json()
                if isinstance(schedules, list) and len(schedules) >= 3:
                    schedule = schedules[0]
                    required_fields = ["id", "missionName", "description", "launchDate", "launchTime", "rocket", "launchSite", "customer", "payload", "status", "createdAt"]
                    if all(field in schedule for field in required_fields) and "_id" not in schedule:
                        self.log_result("Get Schedules", True, f"Retrieved {len(schedules)} schedules with proper structure")
                    else:
                        self.log_result("Get Schedules", False, "Invalid schedule data structure", schedule)
                        return False
                else:
                    self.log_result("Get Schedules", False, "Invalid schedules response or insufficient sample data")
                    return False
            except json.JSONDecodeError:
                self.log_result("Get Schedules", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Get Schedules", False, f"HTTP {response.status_code}", response.text)
            return False
        
        # Test POST schedules (requires authentication)
        if not self.auth_token:
            self.log_result("Create Schedule", False, "No auth token available for testing")
            return False
        
        new_schedule = {
            "missionName": "Asteroid Mining Test",
            "description": "Test mission for asteroid mining technology",
            "launchDate": "2025-04-20T08:00:00Z",
            "launchTime": "08:00 UTC",
            "rocket": "Falcon Heavy",
            "launchSite": "Kennedy Space Center",
            "customer": "Mining Corp",
            "payload": "Mining Probe",
            "status": "scheduled"
        }
        
        response = self.make_request("POST", "/schedules", new_schedule, auth_required=True)
        if response is None:
            self.log_result("Create Schedule", False, "Failed to connect to create schedule endpoint")
            return False
        
        if response.status_code == 201:
            try:
                created_schedule = response.json()
                if "id" in created_schedule and created_schedule["missionName"] == new_schedule["missionName"] and "_id" not in created_schedule:
                    self.log_result("Create Schedule", True, "Schedule created successfully with proper structure")
                    return True
                else:
                    self.log_result("Create Schedule", False, "Invalid created schedule data", created_schedule)
                    return False
            except json.JSONDecodeError:
                self.log_result("Create Schedule", False, "Invalid JSON response")
                return False
        else:
            self.log_result("Create Schedule", False, f"HTTP {response.status_code}", response.text)
            return False
    
    def test_cors_headers(self):
        """Test CORS headers are properly set"""
        print("\n=== Testing CORS Headers ===")
        
        response = self.make_request("GET", "/")
        if response is None:
            self.log_result("CORS Headers", False, "Failed to connect for CORS testing")
            return False
        
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        
        missing_headers = []
        for header in cors_headers:
            if header not in response.headers:
                missing_headers.append(header)
        
        if not missing_headers:
            self.log_result("CORS Headers", True, "All required CORS headers present")
            return True
        else:
            self.log_result("CORS Headers", False, f"Missing CORS headers: {missing_headers}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend API Testing for Rocket Company Website")
        print(f"Testing against: {self.base_url}")
        print("=" * 80)
        
        test_methods = [
            self.test_basic_api,
            self.test_user_registration,
            self.test_user_login,
            self.test_token_verification,
            self.test_rockets_crud,
            self.test_missions_crud,
            self.test_teams_crud,
            self.test_schedules_crud,
            self.test_cors_headers
        ]
        
        passed = 0
        failed = 0
        
        for test_method in test_methods:
            try:
                if test_method():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_result(test_method.__name__, False, f"Test execution error: {str(e)}")
                failed += 1
            
            time.sleep(1)  # Brief pause between tests
        
        print("\n" + "=" * 80)
        print("🏁 BACKEND TESTING COMPLETE")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL BACKEND TESTS PASSED! The API is working correctly.")
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please review the issues above.")
        
        return failed == 0

def main():
    """Main test execution"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()