var debug = require('debug')('mdns:packetfactory');
var os = require('os');
var dns = require('mdns-js-packet');
var DNSPacket = dns.DNSPacket;
var DNSRecord = dns.DNSRecord;

module.exports.buildQDPacket = function () {
  var packet = new DNSPacket();
  if (typeof this.nameSuffix !== 'string') {
    throw new Error('nameSuffix is missing');
  }
  var name = this.options.name + this.nameSuffix;
  var domain = this.options.domain || 'local';
  var serviceType = this.serviceType.toString() + '.' + domain;
  this.alias = name + '.' + serviceType;

  packet.push('qd', new DNSRecord(this.alias, DNSRecord.Type.ANY, 1));
  return packet;
};

module.exports.buildANPacket = function (ttl) {
  if (typeof this.nameSuffix !== 'string') {
    throw new Error('nameSuffix is missing');
  }
  if (typeof this.port !== 'number' && this.port < 1) {
    throw new Error('port is missing or bad value');
  }
  var packet =
    new DNSPacket(DNSPacket.Flag.RESPONSE | DNSPacket.Flag.AUTHORATIVE);
  var name = this.options.name + this.nameSuffix;
  var domain = this.options.domain || 'local';
  var target = (this.options.host || name) + '.' + domain;
  var serviceType = this.serviceType.toString() + '.' + domain;
  var cl = DNSRecord.Class.IN | DNSRecord.Class.FLUSH;

  debug('alias:', this.alias);

  packet.push('an', new DNSRecord(
    serviceType, DNSRecord.Type.PTR, cl, ttl, DNSRecord.toName(this.alias)));

  packet.push('an', new DNSRecord(
    this.alias, DNSRecord.Type.SRV, cl, ttl,
    DNSRecord.toSrv(0, 0, this.port, target)));

  // TODO: https://github.com/agnat/node_mdns/blob/master/lib/advertisement.js
  // has 'txtRecord'
  if ('txt' in this.options) {
    packet.push('an', new DNSRecord(
      this.alias, DNSRecord.Type.TXT, cl, ttl,
      DNSRecord.toTxt(this.options.txt)));
  }

  var interfaces = os.networkInterfaces();
  var ifaceFilter = this.options.networkInterface;
  for (var key in interfaces) {
    if (typeof ifaceFilter === 'undefined' || key === ifaceFilter) {
      debug('add A record for interface:' , key);
      for (var i = 0; i < interfaces[key].length; i++) {
        var address = interfaces[key][i].address;
        if (address.indexOf(':') === -1) {
          packet.push('an', new DNSRecord(
            target, DNSRecord.Type.A, cl, ttl, DNSRecord.toA(address)));
        } else {
          // TODO: also publish the ip6_address in an AAAA record
        }
      }
    }
  }
  return packet;
};
