import secrets
from flask import Flask, render_template, redirect, session
from users.models import db
from dotenv import dotenv_values

app = Flask(__name__)
app.secret_key = dotenv_values(".env")['apppass']

from users.router import outer_routes
outer_routes(app, db)

cuisines = ['african', 'american', 'british', 'cajun', 'caribbean', 'chinese', 'eastern european', 'european', 'french', 'german' ,'greek' ,'indian' ,'irish' ,'italian' ,'japanese' ,'jewish' ,'korean' ,'latin american', 'mediterranean' ,'mexican' ,'middle eastern' ,'nordic' ,'southern' ,'spanish' ,'thai' ,'vietnamese']

@app.route('/')
def ind():
    return redirect('/home')

@app.route('/home/')
def home():
    print(session)
    return render_template('home.html', websession=session)

@app.route('/recipes/')
def recipes():
    return render_template('recipe.html', websession=session)

@app.route('/contact-us/')
def contactus():
    return render_template('contact.html', websession=session)

@app.route('/cuisine/<cuisine>/')
def cuisine(cuisine):
    return render_template('cuisine-section.html', name=cuisine, websession=session)

@app.route('/recipe/<recipe>/<cuisine>')
def details(recipe=0, cuisine=None):
    if cuisine not in cuisines:
        return render_template('details.html', id=recipe, websession=session, creator=False)
    fRecipe = db[cuisine].find_one({"id": int(recipe)})
    key = 'creator'
    print(type(key), type(fRecipe), key, fRecipe)
    if not fRecipe:
        return render_template('details.html', id=recipe, websession=session, creator=False)
    else:
        if key in fRecipe:
            if session:
                if session['logged_in'] and fRecipe['creator'] == session['user']['username']:
                    return render_template('details.html', id=recipe, websession=session, creator=True)
                else:
                    return render_template('details.html', id=recipe, websession=session, creator=False)
            else:
                return render_template('details.html', id=recipe, websession=session, creator=False)
        else:
            return render_template('details.html', id=recipe, websession=session, creator=False)

@app.route('/profile/')
def profile():
    if session:
        if session['logged_in']:
            return render_template('profile.html', websession=session)
        else:
            return redirect('/login')
    else:
        return redirect('/login')

if __name__ == '__main__':  
    app.run(debug=True)