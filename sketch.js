let song;
let peaks;
let dragging = false; 
let currentTime = 0; 
var button;

function preload() {
  song = loadSound("media/Vibing Over Venus.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  peaks = song.getPeaks(width);

  button = createButton("play");
  button.mousePressed(togglePlaying);
  button.position(20, 20);
  background(51);

  createDiv().id("debug");
}

function draw() {
  background(0);
  let currentPlaybackTime;

  if (dragging) {
    currentPlaybackTime = map(mouseX, 0, width, 0, song.duration());
    currentPlaybackTime = constrain(currentPlaybackTime, 0, song.duration());
    currentTime = currentPlaybackTime;
  } else if (song.isPlaying()) {
    currentTime = Math.round(song.currentTime() * 100) / 100;
    currentPlaybackTime = currentTime;
  } else {
    currentPlaybackTime = currentTime;
  }

  let xPosition = map(currentPlaybackTime, 0, song.duration(), 0, width);

  strokeWeight(1.3);
  stroke(255, 0, 0);
  line(xPosition, 0, xPosition, height);

  stroke(255);
  for (let i = 0; i < width; i++) {
    let peakIndex = floor((i / width) * peaks.length);
    let peakValue = peaks[peakIndex];
    line(i, height / 2 + peakValue * 100, i, height / 2 - peakValue * 100);
  }
}

function togglePlaying() {
  if (!song.isPlaying()) {
    song.play();
    song.setVolume(0.3);
    button.html("pause");
    print('Started playing at:', currentTime.toFixed(2) + 's');
    song.jump(currentTime);
  } else {
    song.pause();
    button.html("play");
    print('Paused at:', currentTime.toFixed(2) + 's');
  }
}

function mousePressed() {
  let timePosition = map(currentTime, 0, song.duration(), 0, width);
  if (abs(mouseX - timePosition) < 10) {
    dragging = true;
    print('Started dragging at time:', currentTime.toFixed(2) + 's');
  }
}

function mouseReleased() {
  if (dragging) {
    let currentPlaybackTime = map(mouseX, 0, width, 0, song.duration());
    currentPlaybackTime = constrain(currentPlaybackTime, 0, song.duration());
    currentTime = currentPlaybackTime;
    print('Released at time:', currentTime.toFixed(2) + 's');
    
    if (song.isPlaying()) {
      song.jump(currentTime);
      print('Jumped to time:', currentTime.toFixed(2) + 's');
    }
  }
  dragging = false;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  peaks = song.getPeaks(width);
}