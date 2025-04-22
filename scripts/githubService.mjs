import { createLogger } from './logger.mjs';
import config from '../config/response.config.mjs';

class GitHubService {
  constructor(customConfig = {}) {
    this.config = {
      ...config.github,
      ...customConfig
    };
    this.logger = createLogger('GitHubService');
  }

  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'MapleAIHealth'
      }
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Error en solicitud a GitHub API: ${error.message}`);
      throw error;
    }
  }

  async getIssues() {
    try {
      const url = `${this.config.baseUrl}/repos/${this.config.owner}/${this.config.repo}/issues?state=all`;
      const issues = await this.makeRequest(url);
      
      return issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        labels: issue.labels.map(label => label.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        body: issue.body
      }));
    } catch (error) {
      this.logger.error('Error al obtener issues:', error);
      throw error;
    }
  }

  async updateIssueStatus(issueNumber, status) {
    try {
      const url = `${this.config.baseUrl}/repos/${this.config.owner}/${this.config.repo}/issues/${issueNumber}`;
      const data = {
        state: status === 'completed' ? 'closed' : 'open',
        labels: [status === 'completed' ? '✅ Completado' : '⚪ Pendiente']
      };

      const result = await this.makeRequest(url, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });

      this.logger.info(`Issue #${issueNumber} actualizado a estado: ${status}`);
      return result;
    } catch (error) {
      this.logger.error(`Error al actualizar issue #${issueNumber}:`, error);
      throw error;
    }
  }

  async getNextPendingIssue() {
    try {
      const issues = await this.getIssues();
      const todoIssues = issues.filter(issue => 
        issue.state === 'open' && 
        !issue.labels.some(label => label.includes('Completado'))
      );

      if (todoIssues.length === 0) {
        this.logger.info('No se encontraron issues pendientes');
        return null;
      }

      // Verificar si hay issues prioritarios
      if (this.config.priorityIssues && this.config.priorityIssues.length > 0) {
        const priorityIssue = todoIssues.find(issue => 
          this.config.priorityIssues.includes(issue.number.toString())
        );
        
        if (priorityIssue) {
          this.logger.info(`Issue prioritario encontrado: #${priorityIssue.number} - ${priorityIssue.title}`);
          return priorityIssue;
        }
      }

      // Si no hay issues prioritarios, ordenar por número (los más antiguos primero)
      todoIssues.sort((a, b) => a.number - b.number);
      const nextIssue = todoIssues[0];
      
      this.logger.info(`Siguiente issue encontrado: #${nextIssue.number} - ${nextIssue.title}`);
      return nextIssue;
    } catch (error) {
      this.logger.error('Error al obtener siguiente issue pendiente:', error);
      throw error;
    }
  }

  async moveToProjectColumn(issueNumber, columnName) {
    try {
      // Obtener proyectos
      const projects = await this.makeRequest(
        `${this.config.baseUrl}/repos/${this.config.owner}/${this.config.repo}/projects`
      );

      if (!projects || projects.length === 0) {
        throw new Error('No se encontraron proyectos');
      }

      const project = projects[0];

      // Obtener columnas
      const columns = await this.makeRequest(
        `${this.config.baseUrl}/projects/${project.id}/columns`
      );

      const targetColumn = columns.find(col => col.name.toLowerCase() === columnName.toLowerCase());
      if (!targetColumn) {
        throw new Error(`Columna '${columnName}' no encontrada`);
      }

      // Mover issue
      const result = await this.makeRequest(
        `${this.config.baseUrl}/projects/columns/${targetColumn.id}/cards`,
        {
          method: 'POST',
          body: JSON.stringify({
            content_id: issueNumber,
            content_type: 'Issue'
          })
        }
      );

      this.logger.info(`Issue #${issueNumber} movido a la columna: ${columnName}`);
      return result;
    } catch (error) {
      this.logger.error(`Error al mover issue #${issueNumber}:`, error);
      throw error;
    }
  }
}

export default GitHubService; 