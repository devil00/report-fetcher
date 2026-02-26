import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportProvider {
  async fetch(timeout: number = 2000, score: number = 90) {
    await new Promise(r => setTimeout(r, timeout));
    return { score: score };
  }
}