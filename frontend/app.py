import os
from flask import Flask, render_template

app = Flask(__name__)
API_URL = os.getenv("PUBLIC_API_URL", "http://localhost:8000")  # as seen by the browser


@app.get("/")
def index():
    return render_template("index.html", api_url=API_URL)
