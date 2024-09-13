const output = document.getElementById('output');
const config = {
  iceServers: [{
    urls: "stun:stun.l.google.com:19302" // list of free STUN servers: https://gist.github.com/zziuni/3741933
  }]
};
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("chat", {
  negotiated: true,
  id: 0
});
const log = msg => output.innerHTML += `<br>${msg}`;
dc.onopen = () => chat.select();
dc.onmessage = e => log(`> ${e.data}`);
pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);

chat.onkeypress = function(e) {
  if (e.keyCode != 13) return;
  dc.send(chat.value);
  log(chat.value);
  chat.value = "";
};

async function createOffer() {
  button.disabled = true;
  await pc.setLocalDescription(await pc.createOffer());
  pc.onicecandidate = ({
    candidate
  }) => {
    if (candidate) return;
    offer.value = pc.localDescription.sdp;
    offer.select();
    answer.placeholder = "Paste answer here. And Press Enter";
  };
}

offer.onkeypress = async function(e) {
  if (e.keyCode != 13 || pc.signalingState != "stable") return;
  button.disabled = offer.disabled = true;
  await pc.setRemoteDescription({
    type: "offer",
    sdp: offer.value
  });
  await pc.setLocalDescription(await pc.createAnswer());
  pc.onicecandidate = ({
    candidate
  }) => {
    if (candidate) return;
    answer.focus();
    answer.value = pc.localDescription.sdp;
    answer.select();
  };
};

answer.onkeypress = function(e) {
  if (e.keyCode != 13 || pc.signalingState != "have-local-offer") return;
  answer.disabled = true;
  pc.setRemoteDescription({
    type: "answer",
    sdp: answer.value
  });
};

pc.onconnectionstatechange = ev => handleChange();
pc.oniceconnectionstatechange = ev => handleChange();

function handleChange() {
  let stat = 'ConnectionState: <strong>' + pc.connectionState + '</strong> IceConnectionState: <strong>' + pc.iceConnectionState + '</strong>';
  document.getElementById('stat').innerHTML = stat;
  console.log('%c' + new Date().toISOString() + ': ConnectionState: %c' + pc.connectionState + ' %cIceConnectionState: %c' + pc.iceConnectionState,
    'color:yellow', 'color:orange', 'color:yellow', 'color:orange');
}
handleChange();