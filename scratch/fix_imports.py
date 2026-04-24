import os
import re

root_dir = "backend/app"

replacements = [
    (r"from database import", "from app.db.session import"),
    (r"import database", "from app.db import session as database"),
    (r"from models import", "from app.models.user import"),
    (r"from schemas import", "from app.schemas.base import"),
    (r"from auth import", "from app.core.security import"),
    (r"from config import", "from app.core.config import"),
    (r"from otp_service import", "from app.services.otp import"),
    (r"from app\.config import", "from app.core.config import"),
    (r"from app\.models\.chat import", "from app.models.chat_history import"),
    (r"from app\.services\.llm_service import", "from app.services.llm import"),
    (r"from app\.routes\.chat import", "from app.api.v1.chat import"),
    (r"from app\.routes\.speech import", "from app.api.v1.speech import"),
]

for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".py"):
            file_path = os.path.join(subdir, file)
            with open(file_path, "r") as f:
                content = f.read()
            
            new_content = content
            for pattern, replacement in replacements:
                new_content = re.sub(pattern, replacement, new_content)
            
            if new_content != content:
                with open(file_path, "w") as f:
                    f.write(new_content)
                print(f"Updated imports in {file_path}")
