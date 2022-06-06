import Bee from 'bee-queue';
import CancellationMail from '../jobs/CancellationMail';
import redisConfig from './redis';

const jobs = [CancellationMail];
class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  // posso destruturar o job direto com o key e o handle
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // queue: a qual fila eu quero adicionar um novo trabalho
  // job: o trabalho que eu quero adicionar e os parametros
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key];
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, error) {
    console.log(`Queue ${job.queue.name}: FAILED`, error);
  }
}

export default new Queue();
