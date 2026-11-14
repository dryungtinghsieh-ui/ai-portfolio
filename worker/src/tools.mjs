import research from './research.json' with { type: 'json' };

const schema = (name, description, properties, required) => ({
  type: 'function', function: { name, description, parameters: {
    type: 'object', properties, required, additionalProperties: false,
  } },
});

export const tools = [
  schema('signal_basics', 'Calculate simple signal-integrity quantities. bit_period: value is data rate in Gbps (NRZ only). reflection: value is load resistance in ohms, reference_ohms is line impedance. Return assumptions and explain in plain English.', {
    operation: {type:'string', enum:['bit_period','reflection']}, value:{type:'number'}, reference_ohms:{type:'number'}
  }, ['operation','value','reference_ohms']),
  schema('get_current_time', 'Get the current UTC date and time.', {}, []),
  schema('calculate', 'Perform numeric arithmetic. Subtract, divide and power require two numbers; sqrt requires one. Never executes code.', {
    operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide', 'mean', 'sqrt', 'power'] },
    numbers: { type: 'array', items: { type: 'number' }, minItems: 1, maxItems: 30 },
  }, ['operation', 'numbers']),
  schema('search_research', 'Search Dr. Yung-Ting Hsieh’s published website research catalog and publications, not the live web. Use English keywords, e.g. ECG, neural, signal, interconnect.', {
    query: { type: 'string', minLength: 1, maxLength: 200 },
  }, ['query']),
];

function exactKeys(args, expected) {
  if (!args || typeof args !== 'object' || Array.isArray(args) ||
      Object.keys(args).some(key => !expected.includes(key)) ||
      expected.some(key => !Object.hasOwn(args, key))) throw new Error('Invalid tool arguments');
}

export function executeTool(name, args) {
  if(name === 'signal_basics') {
    exactKeys(args, ['operation','value','reference_ohms']);
    const {operation,value,reference_ohms:z}=args;
    if(!Number.isFinite(value)||value<=0||value>1e6||!Number.isFinite(z)||z<=0||z>1e6) throw new Error('Use positive finite inputs up to 1e6');
    if(operation==='bit_period') return {bit_period_ps:1000/value,assumption:'NRZ signaling: one bit per symbol. Reference impedance is unused.', explanation:'Time available for each bit; shorter time means less room for distortion.'};
    if(operation==='reflection') {const gamma=(value-z)/(value+z);return {reflection_coefficient:gamma,reflected_power_percent:100*gamma*gamma,assumption:'Purely resistive load and real line impedance; ideal single interface, not a full channel simulation.', explanation:'The reflected power percentage shows how much incident power bounces back at this impedance mismatch.'};}
    throw new Error('Unknown signal operation');
  }
  if (name === 'get_current_time') {
    exactKeys(args, []);
    return { utc: new Date().toISOString() };
  }
  if (name === 'calculate') {
    exactKeys(args, ['operation', 'numbers']);
    const n = args.numbers;
    if (!Array.isArray(n) || n.length < 1 || n.length > 30 ||
        n.some(v => typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > 1e100)) {
      throw new Error('Use 1–30 finite numbers, each at most 1e100 in magnitude');
    }
    const op = args.operation;
    if (['subtract', 'divide', 'power'].includes(op) && n.length !== 2) throw new Error('This operation needs exactly two numbers');
    if (op === 'sqrt' && n.length !== 1) throw new Error('Square root needs exactly one number');
    if (op === 'divide' && n[1] === 0) throw new Error('Division by zero is not allowed');
    let value;
    switch (op) {
      case 'add': value = n.reduce((a, b) => a + b, 0); break;
      case 'subtract': value = n[0] - n[1]; break;
      case 'multiply': value = n.reduce((a, b) => a * b, 1); break;
      case 'divide': value = n[0] / n[1]; break;
      case 'mean': value = n.reduce((a, b) => a + b, 0) / n.length; break;
      case 'sqrt': value = Math.sqrt(n[0]); break;
      case 'power': value = n[0] ** n[1]; break;
      default: throw new Error('Unknown calculation operation');
    }
    if (!Number.isFinite(value)) throw new Error('Calculation has no finite real result');
    return { operation: op, value };
  }
  if (name === 'search_research') {
    exactKeys(args, ['query']);
    if (typeof args.query !== 'string' || !args.query.trim() || args.query.length > 200) throw new Error('Use a search query of 1–200 characters');
    const terms = args.query.toLowerCase().match(/[\p{L}\p{N}-]+/gu) || [];
    const matches = research.map(project => ({ project,
      score: terms.reduce((sum, term) => sum + (JSON.stringify(project).toLowerCase().includes(term) ? 1 : 0), 0),
    })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map(({ project }) => project);
    return { source: 'Website research catalog (not live web search)', matches };
  }
  throw new Error('Tool is not permitted');
}
