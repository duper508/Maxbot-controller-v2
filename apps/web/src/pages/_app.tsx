import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={(pageProps as { session?: unknown }).session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
