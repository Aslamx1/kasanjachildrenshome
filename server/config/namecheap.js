const https = require('https');
const querystring = require('querystring');

class NamecheapAPI {
  constructor() {
    this.apiKey = process.env.NAMECHEAP_API_KEY;
    this.apiUser = process.env.NAMECHEAP_API_USER;
    this.apiUrl = process.env.NAMECHEAP_API_URL || 'https://api.namecheap.com/api/v1';
    this.sandbox = process.env.NAMECHEAP_SANDBOX === 'true';
    
    if (!this.apiKey || !this.apiUser) {
      throw new Error('Namecheap API credentials not configured');
    }
  }

  /**
   * Make HTTP request to Namecheap API
   */
  async request(command, params = {}) {
    return new Promise((resolve, reject) => {
      const queryParams = {
        ApiUser: this.apiUser,
        ApiKey: this.apiKey,
        UserName: this.apiUser,
        Command: command,
        ClientIp: '127.0.0.1',
        ...params
      };

      const url = `${this.apiUrl}/${command}?${querystring.stringify(queryParams)}`;

      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: data
            });
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Check domain availability
   */
  async checkDomainAvailability(domainName) {
    try {
      const response = await this.request('domains.check', { DomainList: domainName });
      return {
        success: true,
        domain: domainName,
        available: response.data.includes('Available="True"'),
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get list of domains
   */
  async listDomains() {
    try {
      const response = await this.request('domains.getList', { ListType: 'ALL' });
      return {
        success: true,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get DNS records for domain
   */
  async getDNSRecords(domain) {
    try {
      const response = await this.request('domains.dns.getHosts', { Domain: domain });
      return {
        success: true,
        domain: domain,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set DNS records
   */
  async setDNSRecords(domain, records) {
    try {
      const params = { Domain: domain };
      
      records.forEach((record, index) => {
        const i = index + 1;
        params[`HostName${i}`] = record.hostName;
        params[`RecordType${i}`] = record.recordType;
        params[`Address${i}`] = record.address;
        params[`TTL${i}`] = record.ttl || 1800;
      });

      const response = await this.request('domains.dns.setHosts', params);
      return {
        success: true,
        domain: domain,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register domain
   */
  async registerDomain(domainName, years = 1, contactInfo = {}) {
    try {
      const params = {
        DomainName: domainName,
        Years: years,
        RegistrantFirstName: contactInfo.firstName || 'KCH',
        RegistrantLastName: contactInfo.lastName || 'Admin',
        RegistrantAddress1: contactInfo.address || 'Kiryandongo',
        RegistrantCity: contactInfo.city || 'Kiryandongo',
        RegistrantStateProvince: contactInfo.state || 'Uganda',
        RegistrantPostalCode: contactInfo.zip || '00000',
        RegistrantCountry: contactInfo.country || 'UG',
        RegistrantEmailAddress: contactInfo.email || 'admin@kch.org',
        RegistrantPhone: contactInfo.phone || '+256701234567'
      };

      const response = await this.request('domains.create', params);
      return {
        success: true,
        domain: domainName,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo() {
    try {
      const response = await this.request('users.getBalances');
      return {
        success: true,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get SSL certificates list
   */
  async listSSLCertificates() {
    try {
      const response = await this.request('ssl.getList');
      return {
        success: true,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get hosting account info
   */
  async getHostingInfo(username) {
    try {
      const response = await this.request('hosting.getInfo', { Username: username });
      return {
        success: true,
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new NamecheapAPI();
