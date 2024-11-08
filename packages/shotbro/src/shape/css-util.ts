export type CssPropertiesHyphen = {
  'border-width'?: string,
  'border-style'?: string,
  'border-color'?: string,
  'border-radius'?: string,
  'box-shadow'?: string,
  color?: string,
  'font-size'?: string,
  height?: string,
  left?: string,
  position?: string,
  'text-shadow'?: string,
  top?: string,
  width?: string,
}

export function toStyleAttr(props: CssPropertiesHyphen): String {
  return Object.keys(props).map((k) => `${k}:${props[k as keyof typeof props]};`).join('');
}


