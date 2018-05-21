// Sup globals. Fight me.
let model;
let trainingData = {x:[], y:[]};
let predictionData = {x:[], y:[]};

// Step 1. Set up the variables we're trying to learn.
const a = tf.variable(tf.scalar(Math.random()));
const b = tf.variable(tf.scalar(Math.random()));
const c = tf.variable(tf.scalar(Math.random()));
const d = tf.variable(tf.scalar(Math.random()));

init();

function init() {
  // We generated some data according to a formula that's up to cubic, so we want
  // to learn the coefficients for
  // y = a * x ^ 3 + b * x^2 + c * x + d
  trainingData = generateData(10, {a: 1, b:3, c:10, d:4});
  
  // See what our predictions would look like with random coefficients
  const tempCoeff = {
    a: a.dataSync()[0],
    b: b.dataSync()[0],
    c: c.dataSync()[0],
    d: d.dataSync()[0],
  };
  
  predictionData = generateData(10, tempCoeff);
  plot();
}

function plot() {
  const trace1 = {
    x: trainingData.x,
    y: trainingData.y,
    mode: 'lines+markers',
    name: 'Training',
    marker: { size: 12, color:'#29B6F6' }
  };

  const trace2 = {
    x: predictionData.x,
    y: predictionData.y,
    mode: 'markers',
    name: 'Prediction',
    marker: { size: 12, color: '#F06292' }
  };
  
  const layout = {
    margin: {
      l: 30, r: 0, b: 0, t: 0, 
      pad:0
    },
    legend: {
				xanchor:"center",
				yanchor:"top",
				y:1,//number between or equal to -2 and 3,
        x: 0,
				orientation: "v"
	  },
  };
  Plotly.newPlot('graph', [trace1, trace2], layout, {displayModeBar: false});
}  
  
function generateData(points, {a, b, c, d}) {
  let x = [];
  let y = [];
  
  for (let i = 0; i < points; i++) {
    x[i] = i;
    y[i] = a * i*i*i + b * i*i + c * i + d;
  }
  return {x:x, y:y}
}

// Based on https://github.com/tensorflow/tfjs-examples/blob/master/polynomial-regression-core/index.js
async function doALearning() {
  // Create an optimizer, we will use this later. You can play
  // with some of these values to see how the model perfoms.
  const numIterations = 75;
  const learningRate = 0.5;
  const optimizer = tf.train.sgd(learningRate); 
  
  await train(tf.tensor1d(trainingData.x), tf.tensor1d(trainingData.y), numIterations);
  console.log('done');
  
  // See what our predictions look like now!
  const tempCoeff = {
    a: a.dataSync()[0],
    b: b.dataSync()[0],
    c: c.dataSync()[0],
    d: d.dataSync()[0],
  };
  
  console.log(tempCoeff);
  
  predictionData = generateData(10, tempCoeff);
  //plot();
  
  
  // This trains the model.
  async function train(xs, ys, numIterations) {
    for (let iter = 0; iter < numIterations; iter++) {
      // optimizer.minimize is where the training happens.

      // The function it takes must return a numerical estimate (i.e. loss)
      // of how well we are doing using the current state of
      // the variables we created at the start.

      // This optimizer does the 'backward' step of our training process
      // updating variables defined previously in order to minimize the
      // loss.
      optimizer.minimize(() => {
        // Feed the examples into the model
        const pred = predict(xs);
        console.log(xs.get(), pred.get());
        return loss(pred, ys);
      });

      // Use tf.nextFrame to not block the browser.
      await tf.nextFrame();
    }
  }
  
  // Training process functions.
  // This predicts a value
  function predict(x) {
    // y = a * x ^ 3 + b * x ^ 2 + c * x + d
    return tf.tidy(() => {
      return a.mul(x.pow(tf.scalar(3, 'int32')))
        .add(b.mul(x.square()))
        .add(c.mul(x))
        .add(d);
    });
  }
  
  // This tells you how good the prediction is based on what you expected.
  function loss(prediction, labels) {
    // Having a good error function is key for training a machine learning model
    const error = prediction.sub(labels).square().mean();
    console.log(error);
    return error;
  }
  
}


// function learn(xData, yData) {
//   // Define a model for linear regression.
//   model = tf.sequential();
//   model.add(tf.layers.dense({units: 1, inputShape: [1]}));

//   // Prepare the model for training: Specify the loss and the optimizer.
//   model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

//   // Generate some synthetic data for training.
//   const xs = tf.tensor2d(xData, [xData.length, 1]);
//   const ys = tf.tensor2d(yData, [yData.length, 1]);
//   model.fit(xs, ys).then(plot);
//   return model;
// }

// function predict(what) {
//   if (!what) {
//     what = document.getElementById('input').value;
//   }
  
//   // Use the model to do inference on a data point the model hasn't seen before:
//   const prediction = model.predict(tf.tensor2d([what], [1, 1]));
//   console.log(prediction);
  
//   plotData.prediction.x.push(what);
//   plotData.prediction.y.push(prediction.get());
//   console.log(what, prediction.get());
//   plot();
// }