# Let's Interact
## Theme: Accessibility
## About the idea
### Objective:
To empower people who have hearing and speach, visual impairments in group conversations such as conferences or meetings.

### Implementation:
Resolving Hearing Impairment- The person who is unable to hear can interact in virtual meetings by reading others conversation by speech to text ai model. He can give response normally by speaking.

Resolving Speach Impairment- The person who is unable to speak can interact in virtual meetings by hearing others conversation and response by messaging and that message will convert into speech using text to speech ai microservice. It will helpfull for others who are normal to interact with speak impaired person by hearing his speech of it's ai representative and avoid drawing attention to both message and speech at the same time.

Resolving both Speech and Hearing Impairment- The person who is unable to hear and speak can interact in virtual meetings by reading others conversation by speech to text ai model. He give response by messaging and that message will convert into speech using text to speech ai microservice.

Resolving Visual Impairment- If a visually impaired person recieve a message then it will read out using text to speech ai microservice and if any other sharing his screen having textual data then it will read out by summarizing it using ai text summarizer. If he want to message from his side beside audio/video talk then he sends the message by speaking and that will convert into text message using speech to text ai model.

### Procedure:
Step 1- I will create a Flask website and try to create zoom or google meet like some required feature to start discussion on it.

Step 2- It will ask for impairment type at the time of registration and it sets up the platform according to impairment.

Step 3- For Hearing impairment: The unimpaired person who is speaking , his voice will converted into text using speech to text using python module and send onspot to the impaired person and that text will show in a text area in middle bottom of window , pointing to that person, which will visible until other person starts speaking.

For Speaking impairment: The impaired person will type the text in a text box and python autocomplete module help him to type fast. After each sentence completion text will send to other member platform and convert into speech using text to speech ai microservice with a processing animation to keep engaging other member when he is typing.

For both Hearing and Speach impairment: It will use both above mentioned functionality to this type of person.

For Visual impairment: At the time member communicate through speaking if somebody message or share a text document to the impaired person then text to speech ai microservice will speak out and if somebody sharing his screen showing any textual material then it will read out by summarizing it

### Tools Required:
Python,HTML,CSS,JavaScript,MySQL,Flask,Twilio and Text to Speech AI microservice ENG.

### Result:
People who suffers from visual, hearing and speaking impairment can do conversation in conferences and meetings.

Twilio Programmable Video is a cloud platform that allows developers to add video and audio chat to Web applications.
