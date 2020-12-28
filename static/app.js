window.addEventListener("load", () => {
  const root = document.getElementById('wrapper');
  const login = document.getElementById("login");
  const loginForm = document.getElementById("login-form");
  const identityField = document.getElementById("identity");
  const chat = document.getElementById("chat");
  const toggleChat = document.getElementById('toggle_chat');
  const footer = document.getElementById("footer");
  const participants = document.getElementById("participants");
  const shareScreen = document.getElementById('share_screen');
  const chatScroll = document.getElementById('chat-scroll');
  const chatContent = document.getElementById('chat-content');
  const chatInput = document.getElementById('chat-input');
  const usernameSpan = document.getElementById("username");
  
  let chat_box;
  let conv;
  let screenTrack;
  let impairment_type;
		  function connectChat(token, conversationSid) {
		   return Twilio.Conversations.Client.create(token).then(_chat => {
			chat_box = _chat;
			return chat_box.getConversationBySid(conversationSid).then((_conv) => {
				conv = _conv;
				conv.on('messageAdded', (message) => {
					addMessageToChat(message.author, message.body);
				});
				return conv.getMessages().then((messages) => {
					chatContent.innerHTML = '';
					for (let i = 0; i < messages.items.length; i++) {
						addMessageToChat(messages.items[i].author, messages.items[i].body);
					}
					toggleChat.disabled = false;
				});
			});
		}).catch(e => {
			console.log(e);
		});
	   };

		function addMessageToChat(user, message) {
			chatContent.innerHTML += `<p><b>${user}</b>: ${message}`;
			chatScroll.scrollTop = chatScroll.scrollHeight;
		}

		function toggleChatHandler() {
			event.preventDefault();
			if (root.classList.contains('withChat')) {
				root.classList.remove('withChat');
			}
			else {
				root.classList.add('withChat');
				chatScroll.scrollTop = chatScroll.scrollHeight;
			}
		};

		function onChatInputKey(ev) {
			if (ev.keyCode == 13) {
				conv.sendMessage(chatInput.value);
				chatInput.value = '';
			}
		};

	  function shareScreenHandler() {
		event.preventDefault();
		if (!screenTrack) {
			navigator.mediaDevices.getDisplayMedia().then(stream => {
				screenTrack = new Twilio.Video.LocalVideoTrack(stream.getTracks()[0]);
				room.localParticipant.publishTrack(screenTrack);
				screenTrack.mediaStreamTrack.onended = () => { shareScreenHandler() };
				console.log(screenTrack);
				shareScreen.innerHTML = 'Stop sharing';
			}).catch(() => {
				alert('Could not share the screen.')
			});
		}
		else {
			room.localParticipant.unpublishTrack(screenTrack);
			screenTrack.stop();
			screenTrack = null;
			shareScreen.innerHTML = 'Share screen';
		}
	};

  shareScreen.addEventListener('click', shareScreenHandler);
  
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const identity = identityField.value;
    login.setAttribute("hidden", "true");
    // Fetch the access token
    fetch("/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identity: identity }),
    })
      .then((res) => res.json())
      .then(({ token, identity }) => {
        usernameSpan.textContent = identity;
        chat.removeAttribute("hidden");
		footer.removeAttribute("hidden");
		document.getElementsByTagName("h1")[0].style.display = "none";
		impairment= document.getElementById("impairment");
		impairment_type= impairment.options[impairment.selectedIndex].value;
		if(impairment_type=="speech" || impairment_type=="both")
		{
			swal({  title: "Hi! I am Jarvis",
			  text: "You can use me to send voice messages..",
			  icon: "/static/assets/img/bot.png",
            });
			document.getElementById("bot").style.visibility = "visible";
		}
		else{
			document.getElementById("bot").style.visibility = "hidden";
		}
        startVideoChat(room, token);
		connectChat(token,identity);
      });
  });

  function startVideoChat(room, token) {
    // Start video chat and listen to participant connected events
    Twilio.Video.connect(token, {
      room: room,
      audio: true,
      video: true,
    }).then((room) => {
      // Once we're connected to the room, add the local participant to the page
      participantConnected(room.localParticipant);
      // Add any existing participants to the page.
      room.participants.forEach(participantConnected);
      // Listen for other participants to join and add them to the page when they
      // do.
      room.on("participantConnected", participantConnected);
      // Listen for participants to leave the room and remove them from the page
      room.on("participantDisconnected", participantDisconnected);
      // Eject the participant from the room if they reload or leave the page
      window.addEventListener("beforeunload", tidyUp(room));
      window.addEventListener("pagehide", tidyUp(room));
    });
  }

  function participantConnected(participant) {
    // Create new <div> for participant and add it to the page
    let el = document.createElement("div");
    el.setAttribute("id", participant.identity);
    participants.appendChild(el);
    // Find all the participant's existing tracks and publish them to our page
    participant.tracks.forEach((trackPublication) => {
      trackPublished(trackPublication, participant);
    });
    // Listen for the participant publishing new tracks
    participant.on("trackPublished", trackPublished);
  }

  function trackPublished(trackPublication, participant) {
    // Get the participant's <div> we created earlier
    let el = document.getElementById(participant.identity);
    // Find out if the track has been subscribed to and add it to the page or
    // listen for the subscription, then add it to the page.

    // First create a function that adds the track to the page
    let trackSubscribed = (track) => {
      // track.attach() creates the media elements <video> and <audio> to
      // to display the track on the page.
      el.appendChild(track.attach());
	  let labelDiv = document.createElement('label');
      labelDiv.setAttribute('class', 'label');
      labelDiv.innerHTML = participant.identity;
      el.appendChild(labelDiv);
    };
    // If the track is already subscribed, add it immediately to the page
    if (trackPublication.track) {
      trackSubscribed(trackPublication.track);
    }
    // Otherwise listen for the track to be subscribed to, then add it to the
    // page
    trackPublication.on("subscribed", trackSubscribed);
  }

  function participantDisconnected(participant) {
    participant.removeAllListeners();
    const el = document.getElementById(participant.identity);
    el.remove();
  }

  function trackUnpublished(trackPublication) {
    trackPublication.track.detach().forEach(function (mediaElement) {
      mediaElement.remove();
    });
  }

  function tidyUp(room) {
    return function (event) {
      if (event.persisted) {
        return;
      }
      if (room) {
        room.disconnect();
        room = null;
      }
    };
  }
  //toggleChat.addEventListener('click', toggleChatHandler);
  //chatInput.addEventListener('keyup', onChatInputKey);
});

function unhighlight(sender) {
            setTimeout(function(){ 
                var vframe = document.getElementById(sender);
                vframe.style.border="";
			}, 25000);
}

function highlight(sender)
{
  var vframe = document.getElementById(sender);
  vframe.style.border="6px solid green";
}

var socket = io.connect("127.0.0.1:5000");
    socket.on('message', function (msg) {
    highlight(msg["sender"]);
    socket.emit('text2speech',msg["text"]);
	unhighlight(msg["sender"]);
});


function eraseText() {
    document.getElementById("msg").value = "";
}

function send(){
   var msg= document.getElementById("msg").value;
   var identityField = document.getElementById("identity").value;
   socket.emit('send',{"text":msg,"name":identityField});
   eraseText();
}

function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

document.querySelector('.close').addEventListener('click',
	  function(){
	    document.querySelector('.chat-popup').style.display='none';
});