let predictedAges = []
let expressionArr = []
const video = document.getElementById("video");
const sadLabel = document.querySelector('.sad')
const angryLabel = document.querySelector('.angry')
const neturalLabel = document.querySelector('.netural')
const disgustedLabel = document.querySelector('.disgusted')
const fearfulLabel = document.querySelector('.fearful')
const surprisedLabel = document.querySelector('.surprised')
const happyLabel = document.querySelector('.happy')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

video.addEventListener("playing", () => {
  video.style.background = 'none'
  video.style.border = 'none'

  const canvas = faceapi.createCanvasFromMedia(video);
  const videoContainer = document.querySelector('.video-container')
  videoContainer.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

    try {
      setInterval(async () => {
      const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      if(resizedDetections.length>0){
          console.log('resizedDetections ',resizedDetections)
          const age = resizedDetections[0].age;
          const expression = getExpression(resizedDetections[0].expressions)
          expressionArr.push(expression)
          const interpolatedAge = interpolateAgePredictions(age);
          const bottomRight = {
            x: resizedDetections[0].detection.box.bottomRight.x - 50,
            y: resizedDetections[0].detection.box.bottomRight.y
          };
      
          new faceapi.draw.DrawTextField(
            [`${faceapi.utils.round(interpolatedAge, 0)} years`],
            bottomRight
          ).draw(canvas);
        }
    }, 1000);
  } catch (e) {
      console.error(e);
  }

});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}

const getExpression = (obj) => Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);

const showExpression = () =>{

  let angry = 0
  let disgusted = 0
  let fearful = 0
  let happy = 0
  let neutral = 0
  let sad = 0
  let surprised = 0

  angry = expressionArr.filter(x => x === 'angry').length;
  disgusted = expressionArr.filter(x => x === 'disgusted').length;
  fearful = expressionArr.filter(x => x === 'fearful').length;
  happy = expressionArr.filter(x => x === 'happy').length;
  neutral = expressionArr.filter(x => x === 'neutral').length;
  sad = expressionArr.filter(x => x === 'sad').length;
  surprised = expressionArr.filter(x => x === 'surprised').length;

  sadLabel.classList.add('h1-show')
  angryLabel.classList.add('h1-show')
  neturalLabel.classList.add('h1-show')
  disgustedLabel.classList.add('h1-show')
  fearfulLabel.classList.add('h1-show')
  surprisedLabel.classList.add('h1-show')
  happyLabel.classList.add('h1-show')

  sadLabel.innerHTML =  sad
  angryLabel.innerHTML =  angry 
  neturalLabel.innerHTML =  neutral 
  disgustedLabel.innerHTML =  disgusted
  fearfulLabel.innerHTML =  fearful 
  surprisedLabel.innerHTML =  surprised
  happyLabel.innerHTML =  happy
}