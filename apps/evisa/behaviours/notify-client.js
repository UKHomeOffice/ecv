'use strict';
/* eslint-disable prefer-const */

const RealNotifyClient = require('notifications-node-client').NotifyClient; // TODO refactor into constructor
const logger = require('hof/lib/logger')({ env: process.env });

module.exports = class NotifyClient {
  constructor(emailConfig) {
    // Configuration check
    let requiredProperties = ['notifyApiKey', 'agentTemplateId', 'agentEmail'];
    let missing = requiredProperties.filter(property => !emailConfig[property]);
    if (missing.length > 0) {
      let errorMsg = missing.map(property => `config.email ${property} is not defined`).join('\n');
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.emailConfig = emailConfig;
    this.notifyClient = new RealNotifyClient(emailConfig.notifyApiKey);
  }

  async sendAgentEmail(personalisation) {
    await this._sendEmail(
      this.emailConfig.agentTemplateId,
      this.emailConfig.agentEmail,
      personalisation
    );
  }

  async _sendEmail(templateId, emailAddress, personalisation) {
    try {
      await this.notifyClient.sendEmail(templateId, emailAddress, { personalisation });
      logger.info(`Email sent successfully: ${templateId} to ${emailAddress}`);
    } catch (err) {
      let errorDetails = err.response?.data ? `Cause: ${JSON.stringify(err.response.data)}` : '';
      let errorCode = err.code ? `${err.code} -` : '';
      let errorMessage = `${errorCode} ${err.message}; ${errorDetails}`;

      logger.error(`Failed to send Email: ${errorMessage}`);
      throw Error(errorMessage);
    }
  }
};