// // src/app/sitemap.ts
// import { MetadataRoute } from 'next';

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const baseUrl = 'https://gleamlearn.vercel.app';

//   return [
//     {
//       url: baseUrl,
//       lastModified: new Date(),
//       changeFrequency: 'daily',
//       priority: 1.0,
//     },
//     {
//       url: `${baseUrl}/auth/login`,
//       lastModified: new Date(),
//       changeFrequency: 'monthly',
//       priority: 0.5,
//     },
//     {
//       url: `${baseUrl}/auth/signup`,
//       lastModified: new Date(),
//       changeFrequency: 'monthly',
//       priority: 0.5,
//     },
//   ];
// }




import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gleamlearn.vercel.app';

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}