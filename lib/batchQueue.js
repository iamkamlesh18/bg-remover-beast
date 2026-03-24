export class BatchQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  add(task) {
    this.queue.push(task);
  }

  addBatch(tasks) {
    this.queue.push(...tasks);
  }

  next() {
    return this.queue.shift();
  }

  size() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
  }

  async process(processor) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const results = [];
    while (this.queue.length > 0) {
      const task = this.next();
      try {
        const result = await processor(task);
        results.push(result);
      } catch (error) {
        console.error("Batch processing error:", error);
        results.push({ error: error.message });
      }
    }

    this.isProcessing = false;
    return results;
  }
}