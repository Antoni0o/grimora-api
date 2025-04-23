export const generateConfirmEmailTemplate = (token: string, appUrl: string) => {
  const confirmUrl = `${appUrl}/confirm-email?token=${token}`;

  return `
    <h1>Bem-vindo!</h1>
    <p>Clique no link abaixo para confirmar seu e-mail:</p>
    <a href="${confirmUrl}">${confirmUrl}</a>
  `;
};
