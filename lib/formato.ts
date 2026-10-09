// "(11) 98765-4321" enquanto digita (até 11 dígitos)
export function mascaraCelular(text: string): string {
  let val = text.replace(/\D/g, "").substring(0, 11);
  if (val.length > 2) val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
  if (val.length > 9) val = `${val.substring(0, 10)}-${val.substring(10)}`;
  return val;
}
