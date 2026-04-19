#!/usr/bin/env python3
"""
Quick test script to verify Groq API connection
Run this before deploying to ensure everything works
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('src/backend/.env')

def test_groq_connection():
    """Test Groq API connection"""
    print("🔍 Testing Groq API Connection...\n")
    
    # Check if groq is installed
    try:
        from groq import Groq
        print("✅ Groq library installed")
    except ImportError:
        print("❌ Groq library not installed")
        print("   Run: pip install groq")
        return False
    
    # Check API key
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("❌ GROQ_API_KEY not found in .env file")
        return False
    
    print(f"✅ API Key found: {api_key[:20]}...")
    
    # Test API connection
    try:
        print("\n🚀 Testing API call...")
        client = Groq(api_key=api_key)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful PCOS health assistant."
                },
                {
                    "role": "user",
                    "content": "What is PCOS?"
                }
            ],
            model="llama-3.1-70b-versatile",
            max_tokens=100,
            temperature=0.7,
        )
        
        response = chat_completion.choices[0].message.content
        print("✅ API call successful!\n")
        print("📝 Response preview:")
        print("-" * 60)
        print(response[:200] + "..." if len(response) > 200 else response)
        print("-" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        return False

def test_environment_variables():
    """Test all required environment variables"""
    print("\n🔍 Checking Environment Variables...\n")
    
    required_vars = {
        "SECRET_KEY": "Security key for JWT tokens",
        "MODEL_TYPE": "Should be 'groq_api' for deployment",
        "GROQ_API_KEY": "Groq API key",
        "GROQ_MODEL": "Groq model name",
        "SMTP_USERNAME": "Gmail address for OTP",
        "SMTP_PASSWORD": "Gmail app password",
        "FROM_EMAIL": "Email sender address",
    }
    
    all_good = True
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            if var in ["SECRET_KEY", "GROQ_API_KEY", "SMTP_PASSWORD"]:
                display_value = value[:10] + "..." if len(value) > 10 else value
            else:
                display_value = value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: NOT SET ({description})")
            all_good = False
    
    return all_good

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 GROQ API CONFIGURATION TEST")
    print("=" * 60)
    
    # Test environment variables
    env_ok = test_environment_variables()
    
    # Test Groq connection
    groq_ok = test_groq_connection()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    if env_ok and groq_ok:
        print("✅ All tests passed! You're ready to deploy!")
        print("\n🚀 Next steps:")
        print("   1. Push code to GitHub")
        print("   2. Deploy backend to Railway")
        print("   3. Deploy frontend to Vercel")
        print("   4. Test your live app!")
        return 0
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        print("\n📚 Check these files:")
        print("   - src/backend/.env (environment variables)")
        print("   - src/backend/requirements.txt (dependencies)")
        print("   - QUICK_DEPLOY.md (deployment guide)")
        return 1

if __name__ == "__main__":
    sys.exit(main())
