// Store temporário em memória para o fluxo de cadastro
// Limpe este store chamando clearRegistrationData() após o fim do fluxo.

let registrationData: any = {};

export const setRegistrationData = (data: any) => {
  registrationData = { ...registrationData, ...data };
};

export const getRegistrationData = () => {
  return registrationData;
};

export const clearRegistrationData = () => {
  registrationData = {};
};
