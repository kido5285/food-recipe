from flask import Flask, render_template, redirect
from users.models import db

app = Flask(__name__)


from users.router import outer_routes
outer_routes(app, db)

@app.route('/')
def ind():
    return redirect('/home')


@app.route('/home/')
def home():
    return render_template('home.html')

@app.route('/recipes/')
def recipes():
    return render_template('recipe.html')

@app.route('/contact-us/')
def contactus():
    return render_template('contact.html')

@app.route('/cuisine/<cuisine>/')
def cuisine(cuisine):
    return render_template('cuisine-section.html', name=cuisine)

@app.route('/recipe/<recipe>/<cuisine>')
def details(recipe=0, cuisine=None):
    print(recipe)
    return render_template('details.html', id=recipe)

if __name__ == '__main__':
    app.run(debug=True)