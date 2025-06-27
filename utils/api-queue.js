class ApiRequestQueue {
  constructor(delay) {
    this.queue = [];
    this.isProcessing = false;
    this.delay = delay;
  }

  add(requestFunction) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFunction, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const { requestFunction, resolve, reject } = this.queue.shift();

    try {
      const result = await requestFunction();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      await new Promise(res => setTimeout(res, this.delay));
      this.isProcessing = false;
      this.processQueue();
    }
  }
}

const nexonApiQueue = new ApiRequestQueue(500);

module.exports = { nexonApiQueue };
