from flask import Blueprint, request, jsonify
from db import get_db_connection
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth_bp", __name__)

TOKENS = {}  # simple token simulation


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    # basic validation
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400

    conn = get_db_connection()
    # use buffered cursor so results are fully fetched client-side
    cursor = conn.cursor(dictionary=True, buffered=True)
    # check if email already exists
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        conn.close()
        return jsonify({"error": "Email already registered"}), 400

    # hash the password before saving
    hashed_password = generate_password_hash(password)
    cursor.close()
    conn.close()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                   (name, email, hashed_password, role))
    user_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "User registered successfully", "id": user_id}), 201



@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]

    conn = get_db_connection()
    # buffered cursor to avoid unread-result errors
    cursor = conn.cursor(dictionary=True, buffered=True)
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and check_password_hash(user.get("password", ""), password):
        token = str(uuid.uuid4())
        # avoid storing password in token store
        user_safe = {k: v for k, v in user.items() if k != "password"}
        TOKENS[token] = user_safe
        return jsonify({"token": token, "role": user_safe.get("role"), "name": user_safe.get("name"), "user_id": user_safe.get("id")})
    else:
        return jsonify({"error": "Invalid credentials"}), 401
