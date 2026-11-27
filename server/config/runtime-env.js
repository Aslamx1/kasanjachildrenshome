function getRuntimeValue(name, fallback) {
  const runtime = globalThis.__KCH_RUNTIME__;
  let value = runtime && runtime[name];

  if (value === undefined && typeof process !== 'undefined' && process.env) {
    value = process.env[name];
  }

  return value === undefined ? fallback : value;
}

module.exports = { getRuntimeValue };
