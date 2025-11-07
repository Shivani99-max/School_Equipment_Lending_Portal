from flask import Flask
from routes.auth_routes import auth_bp
from routes.equipment_routes import equipment_bp
from routes.borrow_routes import borrow_bp

from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(equipment_bp)
app.register_blueprint(borrow_bp)

if __name__ == "__main__":
    app.run(debug=True)
