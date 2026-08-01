import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // O admin pode colar a URL de qualquer imagem (thumbnail, backdrop, avatar)
    // além de enviar arquivos para o Vercel Blob — travar por allowlist de host
    // quebra a otimização sempre que alguém usa um domínio novo. Como o campo
    // já é de uso exclusivo de administradores, liberamos qualquer host HTTPS.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
