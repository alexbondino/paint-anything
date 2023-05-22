from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/")
def index():
    num = 0
    return render_template("index.html", num=num)



@app.route("/contacto", methods=["POST"])
def contacto():
    nombre = request.form.get("nombre")
    return render_template("contacto.html", nombre=nombre)

if __name__ == '__main__':
    app.run(debug=True)

