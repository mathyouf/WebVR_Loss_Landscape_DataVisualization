/*
Here's the TL; DR of this code example:
- Someone gives us some data that was generated according to a cubic formula (i.e. something of
the form y = a * x ^ 3 + b * x^2 + c * x + d, for a bunch of xs), but doesn't
tell us the values of these a,b,c,d coefficients
- Just by looking at these (x,y) points we were given, we'd like to figure out the coefficients
they were generated from.

And we do this here!

Look out for comments that have 👉 in the code: it means that's code 
you can play around with!
*/

// Sup globals. Fight me. Plots are hard.
const Data = {
  training: {x:[], y:[]},   // the initial data set we're given
  prediction: {x:[], y:[]}, // what we're predicting based on the coefficients
  learning: {x:[], y:[]}    // what we're predicting while learning.
}

let NUM_POINTS;             // how many data points in the set.

// These are the coefficients we're trying to learn. 
// They're all TensorFlows scalars (fancy for "number") and
// initialized to random numbers.
const a = tf.variable(tf.scalar(Math.random()));
const b = tf.variable(tf.scalar(Math.random()));
const c = tf.variable(tf.scalar(Math.random()));
const d = tf.variable(tf.scalar(Math.random()));

init();

function init() {
  NUM_POINTS = parseInt(document.getElementById('points').value || 100);
  
  // Fake the training data. 
  // 👉 you can play with these numbers if you want to generate a 
  // different initial data set!
  Data.training = generateData(NUM_POINTS, {a: -0.8, b:-0.2, c:0.9, d:0.5});
  
  // Firt, see what our predictions would look like with random coefficients
  const coeff = {
    a: a.dataSync()[0],
    b: b.dataSync()[0],
    c: c.dataSync()[0],
    d: d.dataSync()[0],
  };
  
  Data.prediction = generateData(NUM_POINTS, coeff);
  plot();
}

/*
 * Plots a pretty graph with all the data we have!
 * Uses plotly.js
 */

function plot() {
  const trace1 = {
    x: Data.training.x,
    y: Data.training.y,
    mode: 'lines+markers',
    name: 'Training',
    marker: { size: 12, color:'#29B6F6' }
  };

  const trace2 = {
    x: Data.prediction.x,
    y: Data.prediction.y,
    mode: 'lines+markers',
    name: 'Prediction',
    marker: { size: 12, color: '#F06292' }
  };
  
  let trace3 = {};
  if (Data.learning) {
    trace3 = {
      x: Data.learning.x,
      y: Data.learning.y,
      mode: 'lines+markers',
      name: 'Learning',
      marker: { size: 12, color: '#00E676' }
    };
  }
  
  const layout = {
    margin: {
      l: 30, r: 0, b: 0, t: 0, 
      pad:0
    },
    legend: {
				xanchor:"center",
				yanchor:"top",
				y: 1,  //tbh i don't know what these numbers mean?!
        x: 0,
				orientation: "v"
	  },
  };
  Plotly.newPlot('graph', [trace1, trace2, trace3], layout, {displayModeBar: false});
}  

/*
 * Generates data according to the formula:
 * y = a * x ^ 3 + b * x^2 + c * x + d
 */
function generateData(points, {a, b, c, d}) {
  let x = [];
  let y = [];
  
  // Normalize the x values to be between -1 and 1.
  // 🚨 This is super important! TensorFlow requires this
  // for the algorithm to work, and if you don't do this
  // you learn NaN for every coefficient.
  const xs = tf.randomUniform([points], -1, 1);  // magic TF to give you points between [-1, 1]
  for (let i = 0; i < points; i++) {
    x[i] = xs.get(i);  // goes from a TF tensor (i.e. array) to a number.
  }
  x = x.sort(function(a,b){return a - b})
  
  // Generate the random y values.  
  for (let i = 0; i < points; i++) {
    const val = x[i];
    y[i] = a * (val*val*val) + b * (val*val) + c * val + d;
  }
  
  // Normalize the y values to be between 0 and 1
  const ymin = Math.min(...y);
  const ymax = Math.max(...y);
  const yrange = ymax - ymin;
  
  for (let i = 0; i < points; i++) {
    const val = y[i];
    y[i] = (y[i] - ymin) / yrange;
  }
  
  return {x:x, y:y}
}

/*
 * Learn the coefficients.
 * Very much based on https://github.com/tensorflow/tfjs-examples/blob/master/polynomial-regression-core/index.js
 */
function doALearning() {
  // Create an optimizer. This is the thing that does the learning.
  // 👉 you can play with these two numbers if you want to change the 
  // rate at which the algorithm is learning
  
  // How many passes through the data we're doing.
  const numIterations = parseInt(document.getElementById('iterations').value || 75);
  
  // How fast we are learning.
  const learningRate = 0.5;
  
  /* 
    Docs: https://js.tensorflow.org/api/0.11.1/#train.sgd
    - sgd means "stochastic gradient descent". 
    - stochastic means "probabilistic"
    - gradient descent means that at every step, we move our predictions 
    in the direction of the answer. How much to move involves derivatives (the "gradient")
    - the full algorithm is here but it's...mathy: https://en.wikipedia.org/wiki/Stochastic_gradient_descent
    - this is why having tensorflow is good!!
  */ 
  const optimizer = tf.train.sgd(learningRate); 
  
  // Use the training data, and do numIteration passes over it. 
  await train(tf.tensor1d(trainingData.x), tf.tensor1d(trainingData.y), numIterations);
  
  // Once that is done, this has updated our coefficients! 
  // Here you could see what our predictions look like now, and use them!
  // Example:
  // const coeff = {
  //   a: a.dataSync()[0],
  //   b: b.dataSync()[0],
  //   c: c.dataSync()[0],
  //   d: d.dataSync()[0],
  // };
  // prediction = generateData(NUM_POINTS, coeff);
  // plot();
  
  /*
   * This does the training of the model.
   */
  async function train(xs, ys, numIterations) {
    for (let iter = 0; iter < numIterations; iter++) {
      const tempCoeff = {
        a: a.dataSync()[0],
        b: b.dataSync()[0],
        c: c.dataSync()[0],
        d: d.dataSync()[0],
      };
      learningData = generateData(NUM_POINTS, tempCoeff);
      plot();
  
      
      // optimizer.minimize is where the training happens.


      // This optimizer does the 'backward' step of our training process
      // updating variables defined previously in order to minimize the
      // loss.
      // This is where the step happens, and when the training takes place.
      // 
      optimizer.minimize(() => {
        // Using our estimated coeff, predict all the ys for all the xs 
        const pred = predict(xs);
        
        // Need to return the loss i.e how bad is our prediction from the 
        // correct answer.
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
    return error;
  }
}