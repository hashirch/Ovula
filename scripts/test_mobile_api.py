import requests
import sys

BASE_URL = "http://localhost:8000"
TEST_USER = {
    "name": "Test Mobile User",
    "email": "testmobile@example.com",
    "password": "Password123!"
}

def run_tests():
    print(f"Testing Backend APIs at {BASE_URL}...")
    
    # 1. Register or Login
    print("\n--- Testing Auth ---")
    session = requests.Session()
    
    # Try login first
    login_res = session.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    
    if login_res.status_code != 200:
        print("User not found or wrong password, registering...")
        reg_res = session.post(f"{BASE_URL}/auth/register", json=TEST_USER)
        print(f"Register: {reg_res.status_code}")
        # Assuming OTP is disabled or we can bypass for test
        login_res = session.post(f"{BASE_URL}/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
    
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        return
        
    token = login_res.json().get("access_token")
    print(f"Login successful, token retrieved.")
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    # Get Me
    me_res = session.get(f"{BASE_URL}/auth/me")
    print(f"GET /auth/me: {me_res.status_code}")
    if me_res.status_code == 200:
        print(f"  Response: {me_res.json().get('email')}")
        
    # 2. Logs
    print("\n--- Testing Logs ---")
    log_data = {
        "date": "2024-01-01",
        "period_status": "period",
        "mood": 4,
        "acne": 1,
        "hairfall": 1,
        "weight": 65.5,
        "sleep_hours": 7.5,
        "cravings": 2,
        "pain_level": 3,
        "notes": "Test log from mobile integration script"
    }
    create_log_res = session.post(f"{BASE_URL}/logs/", json=log_data)
    print(f"POST /logs/: {create_log_res.status_code}")
    
    get_logs_res = session.get(f"{BASE_URL}/logs/")
    print(f"GET /logs/: {get_logs_res.status_code} (Found {len(get_logs_res.json() if get_logs_res.status_code == 200 else [])} logs)")
    
    stats_res = session.get(f"{BASE_URL}/logs/stats")
    print(f"GET /logs/stats: {stats_res.status_code}")
    
    # 3. Insights
    print("\n--- Testing Insights ---")
    insights_res = session.get(f"{BASE_URL}/insights/")
    print(f"GET /insights/: {insights_res.status_code}")
    
    # 4. Prediction
    print("\n--- Testing Prediction ---")
    profile_data = {
        "age_group": 2,
        "is_overweight": 0,
        "has_weight_fluctuation": 0,
        "has_irregular_periods": 0,
        "typical_period_length": 5,
        "typical_cycle_length": 28,
        "difficulty_conceiving": 0,
        "has_acne": 0,
        "has_hair_loss": 0,
        "always_tired": 0
    }
    create_prof_res = session.post(f"{BASE_URL}/prediction/health-profile", json=profile_data)
    print(f"POST /prediction/health-profile: {create_prof_res.status_code}")
    
    predict_res = session.post(f"{BASE_URL}/prediction/predict")
    print(f"POST /prediction/predict: {predict_res.status_code}")
    if predict_res.status_code == 200:
        print(f"  Result: {predict_res.json().get('prediction')} (Risk: {predict_res.json().get('risk_score')})")
        
    print("\n✅ All basic mobile API endpoints tested!")

if __name__ == "__main__":
    try:
        requests.get(BASE_URL)
        run_tests()
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend is not running at {BASE_URL}. Please start the backend first.")
