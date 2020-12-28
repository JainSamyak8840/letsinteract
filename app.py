import os
import http.client
import base64
import json
#import redis
import multiprocessing
from dotenv import load_dotenv
from flask import Flask, render_template, request, abort, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant, ChatGrant
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from flask_cors import CORS
from playsound import playsound

load_dotenv()
twilio_account_sid = os.environ["TWILIO_ACCOUNT_SID"]
twilio_api_key_sid = os.environ["TWILIO_API_KEY_SID"]
twilio_api_key_secret = os.environ["TWILIO_API_KEY_SECRET"]
twilio_client = Client(twilio_api_key_sid, twilio_api_key_secret,
                       twilio_account_sid)

#REDIS_URL = os.environ['REDIS_URL']
#REDIS_CHAN = 'server'
app = Flask(__name__)
app.debug = 'DEBUG' in os.environ
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app)
#redis = redis.from_url(REDIS_URL)
conn = http.client.HTTPSConnection("apis.sentient.io")

headers = {
    'content-type': "application/json",
    'x-api-key': "10524A006C204B98A8D5"
    }
    
def get_chatroom(name):
    for conversation in twilio_client.conversations.conversations.list():
        if conversation.friendly_name == name:
            return conversation

    # a conversation with the given name does not exist ==> create a new one
    return twilio_client.conversations.conversations.create(
        friendly_name=name)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/meeting/<username>_<password>')
def meeting(username,password):
    return render_template('join.html',password=password)

data={"username":"samyak9956","password":"xkjd"}
@app.route('/meeting',methods=['POST','GET'])
def new_meeting():
   username=None
   password=None
   if request.method == 'GET':
     # if sigined in
      username=data["username"]
      password=data['password']
     # else:
       # move to sign in or register if sign not exist if got register if exist then move signin
   else:
      username=request.form.get("meeting_id")
      password=request.form.get("password")
      
   return redirect(url_for('meeting',username=username,password=password))

@app.route('/end_call', methods=['GET'])
def end_call():
    return redirect('/')
    
@app.route('/token', methods=['POST','GET'])
def token():
    username = request.get_json(force=True).get('identity')
    if not username:
        abort(401)

    conversation = get_chatroom('My Room')
    try:
        conversation.participants.create(identity=username)
    except TwilioRestException as exc:
        # do not error if the user is already in the conversation
        if exc.status != 409:
            raise

    token = AccessToken(twilio_account_sid, twilio_api_key_sid,
                        twilio_api_key_secret, identity=username)
    token.add_grant(VideoGrant(room='My Room'))
    token.add_grant(ChatGrant(service_sid=conversation.chat_service_sid))

    return {'token': token.to_jwt().encode().decode(),
            'room': conversation.sid}

   
@socketio.on('send')
def send(msg,methods=['GET', 'POST']):
     mytext= msg["text"]
     sender= msg["name"]
     emit('message',{"text":mytext,"sender":sender}, broadcast=True, include_self=False)
     
@socketio.on('text2speech')
def txt2spch(msg):
   p = None
   try:
     p = multiprocessing.Process(target=playsound, args=("speech.wav",))
     p.terminate()
     os.remove("speech.wav")
   except:
      pass
   payload = "{\"text\":\""+f"{msg}"+"\"}"
   conn.request("POST", "/microservices/voice/ttseng/v0.1/getpredictions", payload, headers)
   res = conn.getresponse()
   data = res.read()
   data = json.loads(data.decode("utf-8"))
   decode_string = base64.b64decode(data["audioContent"])
   with open("speech.wav",'wb') as file:
    file.write(decode_string)
   p.start()
     
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')
