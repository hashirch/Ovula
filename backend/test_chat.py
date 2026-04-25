import asyncio
from app.db.session import SessionLocal
from app.services.llm import llm_service
from app.models.user import User

async def main():
    db = SessionLocal()
    # Find or create a test user
    user = db.query(User).first()
    if not user:
        user = User(name="Test", email="test@test.com", hashed_password="pw")
        db.add(user)
        db.commit()
        db.refresh(user)

    print("Testing base model (qwen:7b)...")
    res = await llm_service.generate_response("What is PCOS?", user.id, db)
    print("Response:", res)

    print("Testing urdu model (mtaimoorhassan/qalb-llm-urdu-improved:latest)...")
    res_urdu = await llm_service.generate_response("What is PCOS?", user.id, db, translate_to_urdu=True)
    print("Urdu Response:", res_urdu)

asyncio.run(main())
