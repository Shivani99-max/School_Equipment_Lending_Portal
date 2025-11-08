from flask import Blueprint, request, jsonify
from db import get_db_connection

request_bp = Blueprint("request_bp", __name__)

@request_bp.route("/request", methods=["POST"])
def request_equipment():
    data = request.get_json()
    user_id = data["user_id"]                # numeric user ID
    equipment_id = data["equipment_id"]      # numeric equipment ID

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # check if equipment is available
    cursor.execute("SELECT available_quantity FROM equipment WHERE id = %s", (equipment_id,))
    result = cursor.fetchone()
    if not result or result[0] <= 0:
        cursor.close()
        conn.close()
        return jsonify({"error": "Equipment not available"}), 400

    # insert borrow request with issue_date = current timestamp, return_date = NULL
    cursor.execute("""
        INSERT INTO requests (user_id, equipment_id, status, issue_date, return_date)
        VALUES (%s, %s, 'pending', NOW(), NULL)
    """, (user_id, equipment_id))
    
    # decrease available quantity
    cursor.execute("""
        UPDATE equipment SET available_quantity = available_quantity - 1
        WHERE id = %s
    """, (equipment_id,))
    
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Request submitted successfully"}), 201



@request_bp.route("/requests", methods=["GET"])
def get_user_requests():
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        return jsonify({"error": "user_id query param is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT r.*, e.name AS equipment_name
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        WHERE r.user_id = %s
        ORDER BY r.issue_date DESC
    """, (user_id,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(rows), 200


@request_bp.route("/requests/<int:req_id>/return", methods=["POST"])
def return_request(req_id):
    """
    Marks a request as 'returned' (if not already) and restores equipment stock.
    Optionally, verify that the caller owns this request (by user_id or token).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get request with equipment
    cursor.execute("""
        SELECT r.id, r.user_id, r.equipment_id, r.status
        FROM requests r
        WHERE r.id = %s
        FOR UPDATE
    """, (req_id,))
    row = cursor.fetchone()
    if not row:
        cursor.close(); conn.close()
        return jsonify({"error": "Request not found"}), 404

    # row = (id, user_id, equipment_id, status)
    status = row[3]
    equipment_id = row[2]

    if status == "returned":
        cursor.close(); conn.close()
        return jsonify({"message": "Already returned"}), 200

    # Only allow return if currently approved (you can relax this if needed)
    if status not in ("approved",):
        cursor.close(); conn.close()
        return jsonify({"error": f"Cannot return when status = {status}"}), 400

    # Update request & restore stock
    cursor.execute("""
        UPDATE requests
        SET status = 'returned', return_date = NOW()
        WHERE id = %s
    """, (req_id,))
    cursor.execute("""
        UPDATE equipment
        SET available_quantity = available_quantity + 1
        WHERE id = %s
    """, (equipment_id,))

    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"message": "Item returned"}), 200



@request_bp.route("/requests/all", methods=["GET"])
def list_all_requests():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT r.*, e.name AS equipment_name, u.name AS user_name
        FROM requests r
        LEFT JOIN equipment e ON e.id = r.equipment_id
        LEFT JOIN users u ON u.id = r.user_id
        ORDER BY COALESCE(r.issue_date, NOW()) DESC, r.id DESC
    """)
    rows = cur.fetchall() or []
    cur.close(); conn.close()
    return jsonify(rows), 200


# --- Approve a request
@request_bp.route("/requests/<int:req_id>/approve", methods=["POST"])
def approve_request(req_id):
    conn = get_db_connection()
    cur = conn.cursor()
    # Only approve if currently pending
    cur.execute("SELECT status FROM requests WHERE id=%s FOR UPDATE", (req_id,))
    row = cur.fetchone()
    if not row:
        cur.close(); conn.close()
        return jsonify({"error": "Request not found"}), 404
    if row[0] != "pending":
        cur.close(); conn.close()
        return jsonify({"error": f"Cannot approve when status={row[0]}"}), 400
    cur.execute("UPDATE requests SET status='approved' WHERE id=%s", (req_id,))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "Approved"}), 200

# --- Reject a request (restore stock only if you had decremented on borrow-submit)
@request_bp.route("/requests/<int:req_id>/reject", methods=["POST"])
def reject_request(req_id):
    conn = get_db_connection()
    cur = conn.cursor()
    # fetch equipment id + status
    cur.execute("SELECT equipment_id, status FROM requests WHERE id=%s FOR UPDATE", (req_id,))
    row = cur.fetchone()
    if not row:
        cur.close(); conn.close()
        return jsonify({"error": "Request not found"}), 404
    equipment_id, status = row
    if status != "pending":
        cur.close(); conn.close()
        return jsonify({"error": f"Cannot reject when status={status}"}), 400
    cur.execute("UPDATE requests SET status='rejected' WHERE id=%s", (req_id,))
    # If you reduced stock during /borrow, consider restoring here:
    # cur.execute("UPDATE equipment SET available_quantity = available_quantity + 1 WHERE id=%s", (equipment_id,))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "Rejected"}), 200