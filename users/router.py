import json
import re
from tracemalloc import start
from turtle import pos
from bson import ObjectId
from flask import Flask, jsonify, request, session, redirect
from flask.templating import render_template
from passlib.hash import pbkdf2_sha256

cuisines = ['african', 'american', 'british', 'cajun', 'caribbean', 'chinese', 'eastern european', 'european', 'french', 'german' ,'greek' ,'indian' ,'irish' ,'italian' ,'japanese' ,'jewish' ,'korean' ,'latin american', 'mediterranean' ,'mexican' ,'middle eastern' ,'nordic' ,'southern' ,'spanish' ,'thai' ,'vietnamese']


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

def start_session(user):
    del user['password']
    session['logged_in'] = True
    json = {
        "username": user['username'],
        "email": user['email'],
        "createdRecipes": user['createdRecipes']
    }
    session['user'] = json
    print(json, session['user'])
    return 'started'

def signout():
    session.clear()
    return redirect('/login')

def outer_routes(app, db):
    @app.route('/getcuisine/<cuisine>', methods=['GET'])
    def getcuisine(cuisine):
        if cuisine in cuisines:
            foundcuisine = list(db[cuisine].find({}))
            cuisinelist = []
            for indcuisine in foundcuisine:
                if 'image' in indcuisine:
                    theinitial = {
                        "id": indcuisine["id"],
                        "image": indcuisine["image"],
                        "title": indcuisine["title"]
                    }
                    cuisinelist.append(theinitial)
                else:
                    print('image does not exist')
            print(JSONEncoder().encode(cuisinelist))
            return jsonify(JSONEncoder().encode(cuisinelist)), 200
        else:
            return 'Cuisine Not Found'
    
    @app.route('/getcuisinebyid/<id>/<cuisine>', methods=['GET'])
    def getcuisinebyid(id=0, cuisine=None):
        if cuisine in cuisines:
            foundRes = db[cuisine].find_one({'id': int(id)})
            if not foundRes:
                return 'Id or Cuisine not found'
            else:
                finishRes = {
                    'title': foundRes['title'],
                    'spoonacularScore': foundRes['spoonacularScore'],
                    'readyInMinutes': foundRes['readyInMinutes'],
                    'summary': foundRes['summary'],
                    'instructions': foundRes['instructions'],
                    'extendedIngredients': foundRes['extendedIngredients'],
                    'image': foundRes['image'],
                    'cuisines': foundRes['cuisines']
                }
                return jsonify(JSONEncoder().encode(finishRes)), 200
        else:
            return 'Cuisine Not Found'

    @app.route('/getnutritionbyid/<id>/<cuisine>', methods=['GET'])
    def getnutritionbyid(id=0, cuisine=None):
        if cuisine in cuisines:
            foundRes = db[cuisine].find_one({'id': int(id)})['nutrition']
            if bool(foundRes) == False:
                return 'Id or Cuisine not found'
            else:
                return jsonify(JSONEncoder().encode(foundRes)), 200
        else:
            return 'Cuisine Not Found'
    
    @app.route('/updaterecipe', methods=['POST'])
    def updaterecipe():
        print(request.form) 
        content = request.form.get('content')
        cuisine = request.form.get('cuisine')
        recipeid = request.form.get('recipeid')
        datadets = request.form.get('data-dets')
        if datadets == 'title':
            db[cuisine].update_one({'id': int(recipeid)}, {'$set' : {'title': content}})
        elif datadets == 'spoonacularScore':
            db[cuisine].update_one({'id': int(recipeid)}, {'$set' : {'spoonacularScore': content}})
        elif datadets == 'readyInMinutes':
            db[cuisine].update_one({'id': int(recipeid)}, {'$set' : {'readyInMinutes': content}})
        elif datadets == 'summary':
            db[cuisine].update_one({'id': int(recipeid)}, {'$set' : {'summary': content}})
        elif datadets[:11] == 'instruction':
            # nth = int(datadets.split('-')[1]) - 1
            # selector = 'extendedIngredients.' + str(nth) + '.original'
            db[cuisine].update_one({'id': int(recipeid)}, {'$set' : {'instructions': content}})
        elif datadets[:9] == 'nutrition' and datadets[-5:] == 'title':
            type = datadets.split('-')[1]
            num = datadets.split('-')[2]
            selector = 'nutrition.' + type + '.' + num + '.title'
            db[cuisine].update_one({'id': int(recipeid)}, {'$set' : {selector: content}})
        elif datadets[:9] == 'nutrition' and datadets[-6:] == 'amount':
            type = datadets.split('-')[1]
            num = datadets.split('-')[2]
            selector = 'nutrition.' + type + '.' + num + '.amount'
            db[cuisine].update_one({'id': int(recipeid)}, {'$set' : {selector: content}})
        elif datadets[:11] == 'ingredients':
            num = datadets.split('-')[1]
            selector = 'extendedIngredients.' + num
            db[cuisine].update_one({'id': int(recipeid)}, {'$set' : {selector: {'original': content}}})
        return jsonify('updated'), 200
    
    @app.route('/submitrecipe/', methods=['GET'])
    def submitrecipe():
        return render_template('addrecipe.html', websession=session)
    
    @app.route('/submitpostrecipe', methods=['POST'])
    def postrecipe():
        cuisines = []
        cuisines.append(request.form.get('cuisines[]'))
        cuisine = request.form.get('cuisines[]')
        postrecipe = {
            "cuisines": cuisines,
            "title": request.form.get('title'),
            "spoonacularScore": int(request.form.get('spoonacularScore')),
            "readyInMinutes": int(request.form.get('readyInMinutes')),
            "id": int(request.form.get('id')),
            "image": request.form.get('image'),
            "summary": request.form.get('summary'),
            "instructions": request.form.get('instructions'),
            "nutrition": json.loads(request.form.get('nutrition')),
            "extendedIngredients": json.loads(request.form.get('extendedIngredients')),
            "creator": session['user']['username']
        }
        db['users'].update_one({'username': session['user']['username']}, {'$push': {'createdRecipes': {"id": postrecipe['id'], "cuisine": postrecipe['cuisines'][0], "name": postrecipe['title'], "href": "/recipe/" + str(postrecipe['id']) + '/' + postrecipe['cuisines'][0]}}})
        db[cuisine].insert_one(postrecipe)
        start_session(db['users'].find_one({'username': session['user']['username']}))
        return jsonify("Success"), 200

    @app.route('/signup/', methods=['GET'])
    def signup():
        if session:
            if session['logged_in']:
                return redirect('/')
            else:
                return render_template('signup.html')
        else:
            return render_template('signup.html')
    
    @app.route('/login/', methods=['GET'])
    def login():
        if session:
            if session['logged_in']:
                return redirect('/')
            else:
                return render_template('signup.html')
        else:
            return render_template('login.html')

    @app.route('/users/signup/', methods=['POST'])
    def postsignup():
        if db['users'].find_one({'username': request.form.get('username')}):
            return jsonify('username already in use'), 406
        elif db['users'].find_one({'email': request.form.get('email')}):
            return jsonify('email already in use'), 406
        else:
            db['users'].insert_one({"username": request.form.get('username'), "email": request.form.get('email'), "password": pbkdf2_sha256.hash(request.form.get('password')), "createdRecipes": []})
            return jsonify('success'), 200

    @app.route('/users/login/', methods=['POST'])
    def postlogin():
        foundUser = db['users'].find_one({'username': request.form.get('username')})
        print(foundUser)
        if not foundUser:
            return jsonify('username not found'), 406
        else:
            if pbkdf2_sha256.verify(request.form.get('password'), foundUser['password']):
                start_session(foundUser)
                return jsonify('success'), 200
            else: 
                return jsonify('password incorrect'), 406
    
    @app.route('/user/signout/', methods=['GET'])
    def usersignout():
        return signout()