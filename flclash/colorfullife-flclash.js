// ColorfulLife FlClash / Mihomo 专用覆写
// v1.0.1 - 2026-09-30
// 目标：Android FlClash + Mihomo，动态兼容机场订阅/proxy-providers。
// 功能：地区组、AI、Spotify、小红书上传、HPOI 广告、广告拦截、内网/VPN直连。
// v1.0.1：FlClash Android 的 TUN/路由完全交由 App 网络设置控制，避免与旁路由/自定义网关冲突；Fake-IP 改用 198.19.0.0/16，降低与上游 OpenClash 常见 198.18.0.0/16 冲突概率。
// 注意：本脚本是网络分流/配置覆写，不提供 Quantumult X 风格 HTTP MITM/响应改写。

function main(config) {
  config = config && typeof config === 'object' ? config : {};
  var originalRules = Array.isArray(config.rules) ? config.rules.slice() : [];

  var G = {
    MAIN: '🚀 主代理',
    ALL: '♻️ 自动选择',
    HK: '🇭🇰 香港',
    TW: '🇹🇼 台湾',
    JP: '🇯🇵 日本',
    SG: '🇸🇬 新加坡',
    US: '🇺🇸 美国',
    OTHER: '🌍 其他节点',
    AI: '🤖 AI',
    SPOTIFY: '🎵 Spotify',
    XHS: '📕 小红书上传',
    HPOI: '🧩 HPOI广告',
    ADS: '🚫 广告拦截',
    GLOBAL: '🌐 GLOBAL'
  };

  var ICON = 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/';
  var RULE_BASE = 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo';
  var RULE_PATH = './rules/colorfullife';
  var INTERVAL = 86400;
  var TEST = {
    hidden: true,
    url: 'https://www.gstatic.com/generate_204',
    interval: 600,
    tolerance: 80,
    lazy: true,
    timeout: 5000,
    'max-failed-times': 3,
    'expected-status': 204,
    'empty-fallback': 'DIRECT'
  };

  var EXCLUDE_COMMON = '(?i)(?:tg|telegram|倒卖|到期|电报|订阅|发布|防止|返利|购买|官方|官网|工单|过期|规则|建议|客服|联系|流量|剩余|失联|网址|邮箱|续费|邀请|重置|梯子|群)';
  var EXCLUDE_AI = '(?i)(?:tg|telegram|倒卖|到期|电报|订阅|发布|防止|返利|购买|官方|官网|工单|过期|规则|建议|客服|联系|流量|剩余|失联|网址|邮箱|续费|邀请|重置|梯子|群|香港|HK|HKG|HONGKONG|HONG KONG|🇭🇰)';

  var REGIONS = [
    {name:G.HK, short:'HK', filter:'(?i)(?:香港|HK|HKG|HONGKONG|HONG KONG|🇭🇰)', icon:'Hong_Kong.png'},
    {name:G.TW, short:'TW', filter:'(?i)(?:台湾|台北|新北|TW|TWN|TAIWAN|TAIPEI|🇹🇼)', icon:'Taiwan.png'},
    {name:G.JP, short:'JP', filter:'(?i)(?:日本|东京|大阪|JP|JPN|JAPAN|TOKYO|OSAKA|🇯🇵)', icon:'Japan.png'},
    {name:G.SG, short:'SG', filter:'(?i)(?:新加坡|狮城|SG|SGP|SINGAPORE|🇸🇬)', icon:'Singapore.png'},
    {name:G.US, short:'US', filter:'(?i)(?:美国|纽约|旧金山|洛杉矶|西雅图|芝加哥|US|USA|NEW YORK|SAN FRANCISCO|LOS ANGELES|SEATTLE|CHICAGO|🇺🇸)', icon:'United_States.png'}
  ];

  function domainProvider(file) {
    return {
      type: 'http', behavior: 'domain', format: 'mrs', interval: INTERVAL,
      path: RULE_PATH + '/geosite-' + file.replace(/[@!]/g, '_') + '.mrs',
      url: RULE_BASE + '/geosite/' + file + '.mrs'
    };
  }
  function ipProvider(file) {
    return {
      type: 'http', behavior: 'ipcidr', format: 'mrs', interval: INTERVAL,
      path: RULE_PATH + '/geoip-' + file + '.mrs',
      url: RULE_BASE + '/geoip/' + file + '.mrs'
    };
  }

  var rp = config['rule-providers'] && typeof config['rule-providers'] === 'object' ? config['rule-providers'] : {};
  var domainSets = {
    'category-ads-all':'category-ads-all', 'private':'private', 'cn':'cn',
    'google':'google', 'google-cn':'google-cn', 'googlefcm':'googlefcm', 'youtube':'youtube',
    'apple':'apple', 'apple-cn':'apple-cn', 'microsoft':'microsoft', 'microsoft-cn':'microsoft@cn',
    'telegram':'telegram', 'spotify':'spotify', 'steam':'steam', 'steam-cn':'steam@cn',
    'category-ai':'category-ai-!cn', 'openai':'openai', 'anthropic':'anthropic',
    'perplexity':'perplexity', 'cursor':'cursor', 'notion':'notion', 'xai':'xai', 'gfw':'gfw',
    'connectivity-check':'connectivity-check', 'category-ntp':'category-ntp'
  };
  Object.keys(domainSets).forEach(function(k){ rp[k] = domainProvider(domainSets[k]); });
  rp['private-ip'] = ipProvider('private');
  rp['cn-ip'] = ipProvider('cn');
  rp['google-ip'] = ipProvider('google');
  rp['telegram-ip'] = ipProvider('telegram');

  rp['hpoi-ads'] = {
    type: 'http', behavior: 'classical', format: 'yaml', interval: INTERVAL,
    path: RULE_PATH + '/hpoi-ads.yaml',
    url: 'https://raw.githubusercontent.com/colorfullife123/hpoi-exhobby-qx/main/hpoi-ads-clash.yaml'
  };

  rp['xhs-upload'] = {
    type: 'inline', behavior: 'classical',
    payload: [
      'DOMAIN,ros-upload.xiaohongshu.com',
      'DOMAIN,edith.xiaohongshu.com'
    ]
  };
  rp['xhs-direct'] = {
    type: 'inline', behavior: 'classical',
    payload: [
      'DOMAIN-SUFFIX,xhscdn.com',
      'DOMAIN,t2.xiaohongshu.com',
      'DOMAIN,apm-native.xiaohongshu.com',
      'DOMAIN,rec.xiaohongshu.com',
      'DOMAIN,www.xiaohongshu.com'
    ]
  };
  config['rule-providers'] = rp;

  function hasProxySource(c) {
    var proxies = Array.isArray(c.proxies) ? c.proxies : [];
    var pp = c['proxy-providers'];
    return proxies.length > 0 || (pp && typeof pp === 'object' && Object.keys(pp).length > 0);
  }

  function withExclude(obj, ex) {
    obj['exclude-filter'] = ex;
    return obj;
  }
  function regionGroup(r) {
    return withExclude({
      name:r.name, type:'select', proxies:['URL Test - ' + r.short],
      'include-all':true, filter:r.filter, 'default-selected':'URL Test - ' + r.short,
      icon:ICON + r.icon
    }, EXCLUDE_COMMON);
  }
  function regionTest(r) {
    var o = {
      name:'URL Test - ' + r.short, type:'url-test', proxies:[], 'include-all':true,
      filter:r.filter, icon:ICON + r.icon
    };
    Object.keys(TEST).forEach(function(k){ o[k]=TEST[k]; });
    return withExclude(o, EXCLUDE_COMMON);
  }

  var groups = [];
  if (!hasProxySource(config)) {
    groups = [
      {name:G.ALL,type:'select',proxies:['DIRECT']},
      {name:G.MAIN,type:'select',proxies:['DIRECT']},
      {name:G.HK,type:'select',proxies:['DIRECT']},
      {name:G.TW,type:'select',proxies:['DIRECT']},
      {name:G.JP,type:'select',proxies:['DIRECT']},
      {name:G.SG,type:'select',proxies:['DIRECT']},
      {name:G.US,type:'select',proxies:['DIRECT']},
      {name:G.AI,type:'select',proxies:[G.MAIN]},
      {name:G.SPOTIFY,type:'select',proxies:[G.MAIN,'DIRECT']},
      {name:G.XHS,type:'select',proxies:[G.HK,G.MAIN,'DIRECT']},
      {name:G.HPOI,type:'select',proxies:['REJECT','DIRECT']},
      {name:G.ADS,type:'select',proxies:['REJECT','DIRECT']},
      {name:G.GLOBAL,type:'select',proxies:[G.MAIN,'DIRECT']}
    ];
  } else {
    var allTest = {name:'URL Test - All',type:'url-test',proxies:[],'include-all':true,icon:ICON+'Auto.png'};
    Object.keys(TEST).forEach(function(k){ allTest[k]=TEST[k]; });
    groups.push(withExclude(allTest, EXCLUDE_COMMON));
    groups.push(withExclude({
      name:G.ALL,type:'select',proxies:['URL Test - All'],'include-all':true,
      'default-selected':'URL Test - All',icon:ICON+'Auto.png'
    }, EXCLUDE_COMMON));

    REGIONS.forEach(function(r){ groups.push(regionTest(r)); groups.push(regionGroup(r)); });

    groups.push(withExclude({
      name:G.OTHER,type:'select',proxies:[G.ALL],'include-all':true,icon:ICON+'Global.png'
    }, EXCLUDE_COMMON));

    groups.push({
      name:G.MAIN,type:'select',
      proxies:[G.ALL,G.HK,G.TW,G.JP,G.SG,G.US,G.OTHER],
      'default-selected':G.ALL,icon:ICON+'Available.png'
    });

    var aiTest = {name:'URL Test - AI',type:'url-test',proxies:[],'include-all':true,icon:ICON+'ChatGPT.png'};
    Object.keys(TEST).forEach(function(k){ aiTest[k]=TEST[k]; });
    groups.push(withExclude(aiTest, EXCLUDE_AI));
    groups.push({
      name:G.AI,type:'select',
      proxies:['URL Test - AI',G.US,G.JP,G.SG,G.TW,G.MAIN],
      'default-selected':'URL Test - AI',icon:ICON+'ChatGPT.png'
    });

    groups.push({
      name:G.SPOTIFY,type:'select',
      proxies:[G.MAIN,G.TW,G.JP,G.US,G.HK,'DIRECT'],
      'default-selected':G.MAIN,icon:ICON+'Spotify.png'
    });
    groups.push({
      name:G.XHS,type:'select',
      proxies:[G.HK,G.MAIN,G.TW,G.JP,'DIRECT'],
      'default-selected':G.HK,icon:ICON+'Xiaohongshu.png'
    });
    groups.push({
      name:G.HPOI,type:'select',proxies:['REJECT','DIRECT',G.MAIN],
      'default-selected':'REJECT',icon:ICON+'AdBlack.png'
    });
    groups.push({
      name:G.ADS,type:'select',proxies:['REJECT','DIRECT',G.MAIN],
      'default-selected':'REJECT',icon:ICON+'AdBlack.png'
    });
    groups.push({
      name:G.GLOBAL,type:'select',
      proxies:[G.MAIN,G.ALL,G.AI,G.SPOTIFY,G.XHS,G.HK,G.TW,G.JP,G.SG,G.US,'DIRECT'],
      'default-selected':G.MAIN,icon:ICON+'Global.png'
    });
  }
  config['proxy-groups'] = groups;

  config.rules = [
    'IP-CIDR,10.0.0.0/8,DIRECT,no-resolve',
    'IP-CIDR,172.16.0.0/12,DIRECT,no-resolve',
    'IP-CIDR,192.168.0.0/16,DIRECT,no-resolve',
    'IP-CIDR,100.64.0.0/10,DIRECT,no-resolve',
    'IP-CIDR6,fc00::/7,DIRECT,no-resolve',
    'IP-CIDR6,fe80::/10,DIRECT,no-resolve',

    'RULE-SET,hpoi-ads,' + G.HPOI,
    'DOMAIN-SUFFIX,hpoi.net.cn,DIRECT',
    'DOMAIN-SUFFIX,hpoi.net,DIRECT',
    'DOMAIN-SUFFIX,exhobby.net,' + G.MAIN,

    'RULE-SET,xhs-upload,' + G.XHS,
    'RULE-SET,xhs-direct,DIRECT',

    'RULE-SET,category-ads-all,' + G.ADS,

    'RULE-SET,private,DIRECT',
    'RULE-SET,private-ip,DIRECT,no-resolve',

    'RULE-SET,openai,' + G.AI,
    'RULE-SET,anthropic,' + G.AI,
    'RULE-SET,perplexity,' + G.AI,
    'RULE-SET,cursor,' + G.AI,
    'RULE-SET,notion,' + G.AI,
    'RULE-SET,xai,' + G.AI,
    'RULE-SET,category-ai,' + G.AI,

    'RULE-SET,googlefcm,' + G.MAIN,
    'RULE-SET,youtube,' + G.MAIN,
    'RULE-SET,google,' + G.MAIN,
    'RULE-SET,google-ip,' + G.MAIN + ',no-resolve',
    'RULE-SET,google-cn,DIRECT',

    'RULE-SET,telegram,' + G.MAIN,
    'RULE-SET,telegram-ip,' + G.MAIN + ',no-resolve',

    'RULE-SET,spotify,' + G.SPOTIFY,

    'DOMAIN-SUFFIX,steamcontent.com,DIRECT',
    'DOMAIN-SUFFIX,steamserver.net,DIRECT',
    'DOMAIN-SUFFIX,steampipe.akamaized.net,DIRECT',
    'RULE-SET,steam-cn,DIRECT',
    'RULE-SET,steam,' + G.MAIN,

    'RULE-SET,apple-cn,DIRECT',
    'RULE-SET,apple,' + G.MAIN,
    'RULE-SET,microsoft-cn,DIRECT',
    'RULE-SET,microsoft,' + G.MAIN,

    'RULE-SET,connectivity-check,DIRECT',
    'RULE-SET,category-ntp,DIRECT',

    'RULE-SET,gfw,' + G.MAIN,
    'RULE-SET,cn,DIRECT',
    'RULE-SET,cn-ip,DIRECT,no-resolve',
    'MATCH,' + G.MAIN
  ];

  var preservedDirect = originalRules.filter(function(rule) {
    var r = String(rule || '').trim();
    return r && r.charAt(0) !== '#' && /,DIRECT(?:,|$)/i.test(r);
  });
  if (preservedDirect.length) {
    var finalMatch = config.rules.pop();
    preservedDirect.forEach(function(rule) {
      if (config.rules.indexOf(rule) === -1) config.rules.push(rule);
    });
    config.rules.push(finalMatch);
  }

  config.mode = 'rule';
  config['tcp-concurrent'] = true;
  config['unified-delay'] = true;
  config['find-process-mode'] = 'off';
  config['log-level'] = 'warning';
  config['keep-alive-interval'] = 30;
  config['keep-alive-idle'] = 600;
  config.profile = config.profile && typeof config.profile === 'object' ? config.profile : {};
  config.profile['store-selected'] = true;
  config.profile['store-fake-ip'] = true;

  // Android FlClash 的 VpnService/TUN 参数由 App -> 网络 设置最终生成。
  // 不在覆写脚本里强制写 tun/auto-route/stack，避免与旁路由、自定义网关和 FlClash 路由模式冲突。

  config.sniffer = {
    enable:true,
    'force-dns-mapping':true,
    'parse-pure-ip':true,
    'override-destination':false,
    sniff:{
      HTTP:{ports:[80,'8080-8442','8444-8880'],'override-destination':false},
      TLS:{ports:[443,8443],'override-destination':true},
      QUIC:{ports:[443,8443],'override-destination':true}
    },
    'skip-domain':['Mijia Cloud','+.push.apple.com','+.oray.com']
  };

  config.dns = {
    enable:true,
    listen:'0.0.0.0:1053',
    ipv6:false,
    'cache-algorithm':'arc',
    'prefer-h3':false,
    'use-hosts':true,
    'use-system-hosts':true,
    'respect-rules':true,
    'enhanced-mode':'fake-ip',
    'fake-ip-range':'198.19.0.1/16',
    'fake-ip-range6':'fc00::/18',
    'fake-ip-filter-mode':'blacklist',
    'fake-ip-filter':[
      'rule-set:private','rule-set:cn','+.cn','+.lan','+.local','localhost','*.localhost',
      '+.qq.com','+.tencent.com','+.qcloud.com','+.wegame.com.cn',
      '+.stun.*.*','+.stun.*.*.*','+.stun.*.*.*.*',
      'rule-set:category-ntp','+.msftconnecttest.com','+.msftncsi.com','+.captive.apple.com'
    ],
    'default-nameserver':['system','223.5.5.5','119.29.29.29','1.1.1.1','8.8.8.8'],
    nameserver:['https://1.1.1.1/dns-query','https://9.9.9.9/dns-query'],
    'proxy-server-nameserver':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
    'direct-nameserver':['system','https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
    'direct-nameserver-follow-policy':true,
    'nameserver-policy':{
      'rule-set:private':['system','https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.qq.com':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.tencent.com':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.qcloud.com':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.wegame.com.cn':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      'rule-set:google,googlefcm,youtube,gfw,telegram,spotify,category-ai,openai,anthropic,perplexity,cursor,notion,xai':['https://1.1.1.1/dns-query','https://9.9.9.9/dns-query'],
      'rule-set:category-ntp':['system','https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.msftconnecttest.com':['system','https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.msftncsi.com':['system','https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.captive.apple.com':['system','https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.steamcontent.com':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.steamserver.net':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      '+.steampipe.akamaized.net':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query'],
      'rule-set:cn,apple-cn,google-cn,microsoft-cn,steam-cn':['https://dns.alidns.com/dns-query','https://doh.pub/dns-query']
    }
  };
  config.hosts = Object.assign({}, config.hosts || {}, {
    'dns.alidns.com':['223.5.5.5','223.6.6.6'],
    'doh.pub':['1.12.12.12','120.53.53.53'],
    'services.googleapis.cn':'services.googleapis.com'
  });

  delete config['geodata-mode'];
  delete config['geo-auto-update'];
  delete config['geo-update-interval'];
  delete config['geox-url'];

  return config;
}
