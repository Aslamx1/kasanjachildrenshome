const { getRuntimeValue } = require('./runtime-env');

class NamecheapAPI {
  async request(command, params = {}) {
    const apiKey = getRuntimeValue('NAMECHEAP_API_KEY');
    const apiUser = getRuntimeValue('NAMECHEAP_API_USER');
    if (!apiKey || !apiUser) {
      throw new Error('Namecheap API credentials are not configured.');
    }

    const queryParams = new URLSearchParams({
      ApiUser: apiUser,
      ApiKey: apiKey,
      UserName: apiUser,
      Command: command,
      ClientIp: getRuntimeValue('NAMECHEAP_CLIENT_IP', '127.0.0.1')
    });
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.set(key, String(value));
      }
    }

    const apiUrl = getRuntimeValue('NAMECHEAP_API_URL', 'https://api.namecheap.com/api/v1');
    const response = await fetch(`${apiUrl}/${command}?${queryParams.toString()}`);
    return {
      status: response.status,
      data: await response.text()
    };
  }

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
