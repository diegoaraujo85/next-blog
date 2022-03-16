import * as prismic from '@prismicio/client';

const endpoint = prismic.getRepositoryEndpoint(process.env.PRISMIC_REPOSITORY);

export const client = prismic.createClient(endpoint, {
  accessToken: process.env.NEXT_PUBLIC_PRISMIC_ACCESS_TOKEN,
});

// https://prismic.io/docs/technologies/react-install
