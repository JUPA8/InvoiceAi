// Caminho: src/i18n/request.ts

import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'pt', 'es', 'fr', 'de', 'hi', 'ja', 'ru', 'zh'];

export default getRequestConfig(async ({locale}) => {
  // Se o locale não for válido, a função para aqui com notFound().
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    // A correção é dizer ao TypeScript que temos certeza
    // que 'locale' não é nulo ou indefinido neste ponto.
    locale: locale!, 
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});