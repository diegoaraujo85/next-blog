import { useState, useCallback } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { client } from '../services/prismic';

import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  page: number;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination);

  const handleLoadMorePosts = useCallback(async () => {
    const url = `${posts.next_page}&access_token=${process.env.NEXT_PUBLIC_PRISMIC_ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    setPosts(state => ({
      ...state,
      ...data,
      results: [...state.results, ...data.results],
    }));
  }, [posts]);

  return (
    <>
      <Header />
      <main className={commonStyles.container}>
        {posts.results.map(post => (
          <div key={post.uid} className={styles.postContainer}>
            <Link href={`post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
            <p className={styles.subtitle}>{post.data.subtitle}</p>
            <div className={styles.metaData}>
              <div>
                <FiCalendar />
                <span>
                  {format(new Date(post.first_publication_date), 'd MMM yyy', {
                    locale: ptBR,
                  })}
                </span>
              </div>

              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </div>
        ))}

        {posts.next_page && (
          <div className={styles.loadMore}>
            <button
              onClick={handleLoadMorePosts}
              className={styles.loadButton}
              type="button"
            >
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = client;
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        page: postsResponse.page,
        results: posts,
      },
    },
  };
};
