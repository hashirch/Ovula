import sqlite3
conn = sqlite3.connect('src/backend/pcos_tracker.db')
conn.execute("UPDATE users SET is_verified = 1 WHERE email = 'testmobile@example.com'")
conn.commit()
conn.close()
print("User verified!")
