// "(11) 98765-4321" enquanto digita (até 11 dígitos)
export function mascaraCelular(text: string): string {
  let val = text.replace(/\D/g, "").substring(0, 11);
  if (val.length > 2) val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
  if (val.length > 9) val = `${val.substring(0, 10)}-${val.substring(10)}`;
  return val;
}

// Anos completos a partir de "aaaa-mm-dd" (só faz aniversário quando chega o dia)
export function idade(nascimento: string, hoje = new Date()): number {
  const [a, m, d] = nascimento.split("-").map(Number);
  const fezAniversario = hoje.getMonth() + 1 > m || (hoje.getMonth() + 1 === m && hoje.getDate() >= d);
  return hoje.getFullYear() - a - (fezAniversario ? 0 : 1);
}
