#key1=2599843882ce4d21848abbc998fa9448
#key2=652ec0b216d3491b80e5903ee4847e26
#key3=a7430e47cd8644ba8812ad8b088dae53
#key4=49935d5bb7d843969adbe99a6a4a0589
#key5=b9250bb72afa4cb78be63553a69d652b
#key6=ae05a802eed645e0b4ad3f3f1a4d8a66
#key7=fa3661c7c3b74aa2a5eb47de5b506ca2  
#key8=ae8d264a51be483686e7a9e458ea9273
#key9=d78a3cc6e37d4cd1a21cecca354a5065
#key10=15bdf7e2fed44eaf9e0564d51c359479
#key11=5922272961dd4c08846e14392625b602
#key12=a28691ce48f44d0dbac37a7583cac3d1
#key13=d2e34dd5554b43d2ab14147ba7b1f0ad
#key14=7e3e1181f0234fec9599075b41cf3da4
#key15=c2da82b5c59d4fb8bea71e2281ec51ac
#key16=6a2597b520154f3d9e3f04b6542d8278
#key17=8bb2c8ef1efd47e58b6538ffeb061cd3
#key18=68e4e4cbe4bb4fad81dbbee3ebfca7ef
#key19=d7da1fbe1fff43cb869aa02945d08ea6
#key20=13203ac9f2d04a07b14b39a1f4fb2b21
#key21=8e46f0400db942eeaff83d13861f840a
#key22=beda276471d94191bd5c273985d4e2f1
#key23=69c28b11a63240dd933b4ee967f1d44a
#key24=6c37ba3d94444a5996424225ba83a712
#key25=8a994c649ee74f56b2cfcdef3a6a1370

from enum import unique
from flask import Flask, request, jsonify
import requests
import pymongo
import json
import os
from pymongo import MongoClient

uri = 'mongodb+srv://ggrass1585:Awyong2006@cluster0.eo9bh.mongodb.net/recipes?retryWrites=true&w=majority'
client = pymongo.MongoClient(uri)
db = client.recipes