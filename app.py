from flask import Flask, render_template, redirect

app = Flask(__name__)

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

@app.route('/recipe/<recipe>/')
def details(recipe=0):
    print(recipe)
    return render_template('details.html', id=recipe)

if __name__ == '__main__':
    app.run(debug=True)