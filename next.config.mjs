/** @type {import('next').NextConfig} */
const nextConfig = {
  // Évite l'échec du build sur les machines lentes (génération statique de la landing)
  staticPageGenerationTimeout: 300,
};
export default nextConfig;