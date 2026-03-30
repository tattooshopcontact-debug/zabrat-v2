import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Web-only: sets <html>, <body>, and #root backgrounds to #0D0D0D
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: DARK_CSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const DARK_CSS = `
html, body, #root {
  background-color: #0D0D0D !important;
  margin: 0;
  padding: 0;
  min-height: 100%;
  color: #FFFFFF;
}
body {
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
#root {
  display: flex;
  flex: 1;
  min-height: 100vh;
}
`;
