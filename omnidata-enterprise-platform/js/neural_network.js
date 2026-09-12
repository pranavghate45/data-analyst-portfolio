/**
 * Client-side Neural Network (Multi-Layer Perceptron) Engine
 */

class NeuralNetworkJS {
  constructor(inputDim, hiddenDim, outputDim, lr = 0.1) {
    this.inputDim = inputDim;
    this.hiddenDim = hiddenDim;
    this.outputDim = outputDim;
    this.lr = lr;

    this.W1 = Array.from({ length: inputDim }, () => Array.from({ length: hiddenDim }, () => Math.random() - 0.5));
    this.b1 = new Array(hiddenDim).fill(0);
    this.W2 = Array.from({ length: hiddenDim }, () => Array.from({ length: outputDim }, () => Math.random() - 0.5));
    this.b2 = new Array(outputDim).fill(0);
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
  }

  train(X, Y, epochs = 40) {
    const history = [];
    const m = X.length;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < m; i++) {
        const x = X[i];
        const yTrue = Y[i];

        // Forward
        const hiddenAct = [];
        for (let j = 0; j < this.hiddenDim; j++) {
          let z1 = this.b1[j];
          for (let k = 0; k < this.inputDim; k++) z1 += x[k] * this.W1[k][j];
          hiddenAct.push(this.sigmoid(z1));
        }

        let z2 = this.b2[0];
        for (let k = 0; k < this.hiddenDim; k++) z2 += hiddenAct[k] * this.W2[k][0];
        const yPred = this.sigmoid(z2);

        const err = yPred - yTrue;
        totalLoss += err * err;

        // Backprop
        const dOut = err * yPred * (1 - yPred);
        for (let k = 0; k < this.hiddenDim; k++) {
          this.W2[k][0] -= this.lr * dOut * hiddenAct[k];
        }
        this.b2[0] -= this.lr * dOut;

        for (let k = 0; k < this.hiddenDim; k++) {
          const dHid = dOut * this.W2[k][0] * hiddenAct[k] * (1 - hiddenAct[k]);
          for (let mIdx = 0; mIdx < this.inputDim; mIdx++) {
            this.W1[mIdx][k] -= this.lr * dHid * x[mIdx];
          }
          this.b1[k] -= this.lr * dHid;
        }
      }

      history.push(Math.round((totalLoss / m) * 10000) / 10000);
    }

    return history;
  }
}
