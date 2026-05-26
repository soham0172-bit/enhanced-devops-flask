from flask import Flask, jsonify

app = Flask(__name__)

students = [
    {"name":"Soham","cgpa":6.95},
    {"name":"Rahul","cgpa":8.2},
    {"name":"Aman","cgpa":7.5}
]

@app.route("/")
def home():
    return "Student Placement Tracker API"

@app.route("/students")
def get_students():
    return jsonify(students)

if __name__=="__main__":
    app.run(debug=True)