let song;
let peaks;
let dragging = false; 
let currentTime = 0;
let slicePositions = [];
var playButton, sliceButton;
let slicePlaying = false;

function preload() {
  song = loadSound("media/Vibing Over Venus.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  peaks = song.getPeaks(width);

  playButton = createButton("play");
  playButton.mousePressed(togglePlaying);
  playButton.position(20, 20);

  sliceButton = createButton("slice");
  sliceButton.mousePressed(sliceWaveform);
  sliceButton.position(70,20);

  background(51);
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

  noStroke();
  fill(0, 0, 255, 50);
  for (let i = 0; i < slicePositions.length - 1; i++) {
    let x1 = map(slicePositions[i], 0, song.duration(), 0, width);
    let x2 = map(slicePositions[i + 1], 0, song.duration(), 0, width);
    
    if (x2 - x1 > 1) {
    rect(x1, 0, x2 - x1, height);
    }
  }

  //draw play line (red)
  strokeWeight(1.3);
  stroke(255, 0, 0);
  line(xPosition, 0, xPosition, height);

  //draw slice line (blue)
  stroke(0, 0, 255);
  strokeWeight(1.5);
  for (let pos of slicePositions) {
    let sliceX = map(pos, 0, song.duration(), 0, width);
    line(sliceX, 0, sliceX, height);
  }

  //draw waveform
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
    song.setVolume(0.5);
    playButton.html("pause");
    print('Started playing at:', currentTime.toFixed(2) + 's');
    song.jump(currentTime);
  } else {
    song.pause();
    playButton.html("play");
    print('Paused at:', currentTime.toFixed(2) + 's');
  }
}

function sliceWaveform() {
  slicePositions.push(currentTime);
  slicePositions = slicePositions.filter((value, index, self) => self.indexOf(value) == index); // removes any dupes
  slicePositions.sort((a, b) => a - b); //sorts low to high
  print("Slice added at:", currentTime.toFixed(2) + "s");
}

function mousePressed() {
  let timePosition = map(currentTime, 0, song.duration(), 0, width);

  if (abs(mouseX - timePosition) < 10) {
    dragging = true;
    print('Started dragging at time:', currentTime.toFixed(2) + 's');
    return;
  }

  for (let i = 0; i < slicePositions.length; i++) {
    let x1 = map(slicePositions[i], 0, song.duration(), 0, width);
    let x2 = map(slicePositions[i+1], 0, song.duration(), 0, width);

    if (mouseX > x1 && mouseX < x2) {
      playSegment(slicePositions[i], slicePositions[i + 1]);
      print(`Clicked inside rectangle from ${slicePositions[i].toFixed(2)}s to ${slicePositions[i + 1].toFixed(2)}s`);
      return;
    }
  }
}

function playSegment(startTime, endTime) {
  song.stop();
  slicePlaying = true;

  song.play(0, 1, 0.5, startTime, endTime - startTime);

  setTimeout(() => {
    song.stop();
    playingRectangle = false;
  } , (endTime - startTime) * 1000);

  print(`Playing from ${startTime.toFixed(2)}s to ${endTime.toFixed(2)}s`);
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