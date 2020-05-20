'use strict';
const config_dev = {
  CompanyCode: 29039,
  BizCompanyCode: 29039,
  Service: {
    IP: '10.3.12.56',
    Port: 16001,
  },
  EDIService: {
    IP: '10.3.12.56',
    Port: 9001,
    Verify: {
      MyVersion: 'V2',
    },
  },
};

const config_pro = {
  CompanyCode: 29039,
  BizCompanyCode: 29039,
  Service: {
    IP: '10.3.12.56',
    Port: 16001,
  },
  EDIService: {
    IP: '10.3.12.56',
    Port: 9001,
    Verify: {
      MyVersion: 'V2',
    },
  },
};

export default process.env.NODE_ENV === 'debug' ? config_dev : config_pro;
