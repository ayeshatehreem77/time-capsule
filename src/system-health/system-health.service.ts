import { Injectable } from '@nestjs/common';
import si from 'systeminformation';

@Injectable()
export class SystemHealthService {
  async getHealth() {
    const cpuLoad = await si.currentLoad();
    const mem = await si.mem();
    const time = await si.time();

    const cpu = Math.round(cpuLoad.currentLoad);
    const ram = Math.round((mem.used / mem.total) * 100);

    // uptime
    const uptimeSeconds = time.uptime;
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    // basic latency
    const start = Date.now();
    const latency = `${Date.now() - start}ms`;

    return {
      cpu,
      ram,
      latency,
      uptime: `${hours}h ${minutes}m`,
    };
  }
}