import api from '@/config/api';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceStatus;
    cache?: ServiceStatus;
    storage?: ServiceStatus;
    email?: ServiceStatus;
  };
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    activeConnections: number;
    requestsPerMinute: number;
  };
}

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: string;
  message?: string;
}

export interface SystemInfo {
  environment: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  totalMemory: number;
  freeMemory: number;
  cpuCores: number;
  hostname: string;
}

export interface ApiStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  lastRestart: string;
  peakConnections: number;
  currentConnections: number;
}

class HealthService {
  private readonly baseUrl = '/health';
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private callbacks: ((status: HealthStatus) => void)[] = [];

  /**
   * Verificar saúde do sistema
   */
  async checkHealth(): Promise<{ success: boolean; data?: HealthStatus; message?: string }> {
    try {
      const response = await api.get(this.baseUrl);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Sistema indisponível'
      };
    }
  }

  /**
   * Verificar saúde com ping simples
   */
  async ping(): Promise<{ success: boolean; latency?: number; message?: string }> {
    const startTime = Date.now();
    try {
      await api.get(`${this.baseUrl}/ping`);
      const latency = Date.now() - startTime;
      return {
        success: true,
        latency
      };
    } catch (error: any) {
      return {
        success: false,
        latency: Date.now() - startTime,
        message: 'Ping falhou'
      };
    }
  }

  /**
   * Obter informações do sistema
   */
  async getSystemInfo(): Promise<{ success: boolean; data?: SystemInfo; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/system`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter informações do sistema'
      };
    }
  }

  /**
   * Obter estatísticas da API
   */
  async getApiStats(): Promise<{ success: boolean; data?: ApiStats; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter estatísticas'
      };
    }
  }

  /**
   * Verificar status de um serviço específico
   */
  async checkService(service: 'database' | 'cache' | 'storage' | 'email'): Promise<{ 
    success: boolean; 
    data?: ServiceStatus; 
    message?: string 
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/service/${service}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || `Serviço ${service} indisponível`
      };
    }
  }

  /**
   * Iniciar monitoramento contínuo
   * @param interval Intervalo em milissegundos (padrão: 30 segundos)
   * @param callback Função chamada a cada verificação
   */
  startMonitoring(interval: number = 30000, callback?: (status: HealthStatus) => void): void {
    if (callback) {
      this.callbacks.push(callback);
    }

    if (this.healthCheckInterval) {
      return; // Já está monitorando
    }

    // Fazer verificação inicial
    this.performHealthCheck();

    // Configurar intervalo
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, interval);
  }

  /**
   * Parar monitoramento
   */
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.callbacks = [];
  }

  /**
   * Adicionar callback de monitoramento
   */
  onHealthCheck(callback: (status: HealthStatus) => void): () => void {
    this.callbacks.push(callback);
    
    // Retornar função para remover callback
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Realizar verificação de saúde e notificar callbacks
   */
  private async performHealthCheck(): Promise<void> {
    const result = await this.checkHealth();
    
    if (result.success && result.data) {
      this.callbacks.forEach(callback => callback(result.data!));
    } else {
      // Em caso de erro, criar status de falha
      const failureStatus: HealthStatus = {
        status: 'down',
        timestamp: new Date().toISOString(),
        uptime: 0,
        version: 'unknown',
        services: {
          database: {
            name: 'Database',
            status: 'down',
            lastCheck: new Date().toISOString()
          }
        }
      };
      this.callbacks.forEach(callback => callback(failureStatus));
    }
  }

  /**
   * Verificar latência média com múltiplos pings
   */
  async checkLatency(count: number = 5): Promise<{ 
    success: boolean; 
    averageLatency?: number; 
    minLatency?: number; 
    maxLatency?: number; 
    message?: string 
  }> {
    const latencies: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const result = await this.ping();
      if (result.success && result.latency) {
        latencies.push(result.latency);
      }
      
      // Pequeno delay entre pings
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (latencies.length === 0) {
      return {
        success: false,
        message: 'Todos os pings falharam'
      };
    }
    
    const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);
    
    return {
      success: true,
      averageLatency: Math.round(averageLatency),
      minLatency,
      maxLatency
    };
  }

  /**
   * Obter status resumido do sistema
   */
  async getSystemSummary(): Promise<{ 
    success: boolean; 
    data?: {
      healthy: boolean;
      services: number;
      servicesUp: number;
      uptime: string;
      latency: number;
      version: string;
    }; 
    message?: string 
  }> {
    try {
      const [healthResult, latencyResult] = await Promise.all([
        this.checkHealth(),
        this.ping()
      ]);
      
      if (!healthResult.success || !healthResult.data) {
        return {
          success: false,
          message: 'Sistema indisponível'
        };
      }
      
      const health = healthResult.data;
      const servicesArray = Object.values(health.services);
      const servicesUp = servicesArray.filter(s => s.status === 'operational').length;
      
      // Converter uptime de segundos para formato legível
      const uptimeHours = Math.floor(health.uptime / 3600);
      const uptimeMinutes = Math.floor((health.uptime % 3600) / 60);
      const uptimeFormatted = `${uptimeHours}h ${uptimeMinutes}m`;
      
      return {
        success: true,
        data: {
          healthy: health.status === 'healthy',
          services: servicesArray.length,
          servicesUp,
          uptime: uptimeFormatted,
          latency: latencyResult.latency || 0,
          version: health.version
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao obter resumo do sistema'
      };
    }
  }
}

export const healthService = new HealthService();