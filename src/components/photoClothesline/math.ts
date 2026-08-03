export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** 由索引推出的稳定伪随机数，SSR 与客户端结果一致 */
export const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 31.7) * 43758.5453;
  return value - Math.floor(value);
};

export const cssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/** 超出自然长度后越拉越吃力，等价于吊带被逐渐拉紧 */
export const softPull = (raw: number, limit: number) => limit * Math.tanh(raw / limit);
