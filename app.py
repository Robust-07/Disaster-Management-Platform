import os
import joblib

from flask import Flask, request, jsonify
from flask_cors import CORS


# =========================================================
# APP
# =========================================================

app = Flask(__name__)

CORS(app)


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)


# =========================================================
# LOAD MODELS
# =========================================================

disaster_model_path = os.path.join(
    MODEL_DIR,
    "disaster_model.pkl"
)

shortage_model_path = os.path.join(
    MODEL_DIR,
    "shortage_model.pkl"
)


sos_model_path = os.path.join(
    MODEL_DIR,
    "sos_model.pkl"
)

try:

    disaster_model = joblib.load(
        disaster_model_path
    )

    shortage_model = joblib.load(
        shortage_model_path
    )

    sos_model = joblib.load(
    sos_model_path
    )

    print("Models loaded successfully!")

except Exception as e:

    print(
        "Error loading models:"
    )

    print(e)

    disaster_model = None
    shortage_model = None
    sos_model = None

# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "service": "Disaster Management ML Service",
        "status": "running",
        "models": {
    "disaster_risk": disaster_model is not None,
    "resource_shortage": shortage_model is not None,
    "sos_severity": sos_model is not None
}
    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
    "status": "healthy",

    "models": {
        "disaster_model":
            disaster_model is not None,

        "shortage_model":
            shortage_model is not None,

        "sos_model":
            sos_model is not None
    }
})


# =========================================================
# DISASTER RISK PREDICTION
# =========================================================

@app.route(
    "/predict/disaster",
    methods=["POST"]
)
def predict_disaster():

    try:

        data = request.get_json()

        required_fields = [
            "rainfall",
            "river_level",
            "humidity",
            "temperature",
            "previous_floods"
        ]

        # Check fields
        for field in required_fields:

            if field not in data:

                return jsonify({
                    "error": f"Missing field: {field}"
                }), 400


        # Create feature vector

        features = [[
            float(data["rainfall"]),
            float(data["river_level"]),
            float(data["humidity"]),
            float(data["temperature"]),
            float(data["previous_floods"])
        ]]


        # Prediction

        prediction = disaster_model.predict(
            features
        )[0]


        # Probability

        probabilities = (
            disaster_model.predict_proba(
                features
            )[0]
        )


        classes = (
            disaster_model.classes_
        )


        probability_dict = {}

        for class_name, probability in zip(
            classes,
            probabilities
        ):

            probability_dict[class_name] = round(
                float(probability),
                4
            )


        # Overall probability of predicted class

        predicted_probability = probability_dict[
            prediction
        ]


        return jsonify({

            "success": True,

            "prediction": {
                "risk": prediction,
                "probability": predicted_probability
            },

            "probabilities": probability_dict

        })


    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# RESOURCE SHORTAGE PREDICTION
# =========================================================

@app.route(
    "/predict/shortage",
    methods=["POST"]
)
def predict_shortage():

    try:

        data = request.get_json()


        required_fields = [
            "population",
            "current_stock",
            "daily_consumption",
            "incoming_supply",
            "people_per_unit"
        ]


        # Validate fields

        for field in required_fields:

            if field not in data:

                return jsonify({
                    "error": f"Missing field: {field}"
                }), 400


        # Features

        features = [[
            float(data["population"]),
            float(data["current_stock"]),
            float(data["daily_consumption"]),
            float(data["incoming_supply"]),
            float(data["people_per_unit"])
        ]]


        # Prediction

        hours = shortage_model.predict(
            features
        )[0]


        hours = max(
            float(hours),
            0
        )


        # Determine status

        if hours <= 2:

            status = "CRITICAL"

        elif hours <= 6:

            status = "WARNING"

        elif hours <= 24:

            status = "MONITOR"

        else:

            status = "SAFE"


        return jsonify({

            "success": True,

            "prediction": {

                "hours_until_shortage": round(
                    hours,
                    2
                ),

                "status": status

            }

        })


    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# RUN SERVER
# =========================================================


# =========================================================
# SOS SEVERITY PREDICTION
# =========================================================

@app.route(
    "/predict/sos",
    methods=["POST"]
)
def predict_sos():

    try:

        data = request.get_json()

        required_fields = [

            "people_trapped",

            "injured_people",

            "critical_injuries",

            "children_elderly",

            "water_level",

            "building_damage",

            "hours_trapped",

            "communication_available"

        ]


        # Check fields

        for field in required_fields:

            if field not in data:

                return jsonify({
                    "success": False,
                    "error": f"Missing field: {field}"
                }), 400


        # Create feature vector

        features = [[

            float(data["people_trapped"]),

            float(data["injured_people"]),

            float(data["critical_injuries"]),

            float(data["children_elderly"]),

            float(data["water_level"]),

            float(data["building_damage"]),

            float(data["hours_trapped"]),

            float(data["communication_available"])

        ]]


        # Prediction

        prediction = sos_model.predict(
            features
        )[0]


        # Probability

        probabilities = (
            sos_model.predict_proba(
                features
            )[0]
        )


        classes = sos_model.classes_


        probability_dict = {}


        for class_name, probability in zip(
            classes,
            probabilities
        ):

            probability_dict[class_name] = round(
                float(probability),
                4
            )


        predicted_probability = (
            probability_dict[prediction]
        )


        # Severity score for UI

        severity_scores = {

            "LOW": 25,

            "MEDIUM": 50,

            "HIGH": 75,

            "CRITICAL": 95

        }


        severity_score = severity_scores[
            prediction
        ]


        return jsonify({

            "success": True,

            "prediction": {

                "severity":
                    prediction,

                "severity_score":
                    severity_score,

                "probability":
                    predicted_probability

            },

            "probabilities":
                probability_dict

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500



if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )