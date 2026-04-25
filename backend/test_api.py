import asyncio
from app.core.security import create_access_token
print(create_access_token({"sub": "test@test.com"}))
