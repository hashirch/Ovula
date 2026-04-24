import os
import re

root_dir = "backend/app"

replacements = [
    (r"from app\.services\.translation_service import", "from app.services.translation import"),
    (r"from app\.services\.elevenlabs_service import", "from app.services.elevenlabs import"),
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
