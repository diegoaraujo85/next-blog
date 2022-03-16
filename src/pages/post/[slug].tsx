import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { client } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface IPost {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: IPost;
}

interface FormatReadingTime {
  heading: string;
  body: {
    text: string;
  }[];
}

const AVERAGE_HUMAN_READING_TIME = 200;

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const estimatedReadingTime = (contents: FormatReadingTime[]): number => {
    const totalLenght = contents.reduce((accumulator, content) => {
      const bodyLength = content.body.reduce((bodyAccumulator, body) => {
        return bodyAccumulator + body.text.split(' ').length;
      }, 0);

      const headingLength = content.heading.split(' ').length;

      return accumulator + bodyLength + headingLength;
    }, 0);

    return Math.ceil(totalLenght / AVERAGE_HUMAN_READING_TIME);
  };

  return (
    <>
      <Header />
      <section className={styles.bannerContainer}>
        <img src={post.data.banner.url} alt={post.data.banner.alt} />
      </section>
      <main className={commonStyles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <section className={styles.metaData}>
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
          <div>
            <FiClock />
            <span>{`${estimatedReadingTime(post.data.content)} min`}</span>
            {/* <span>4 min</span> */}
          </div>
        </section>

        <section className={styles.content}>
          {post.data.content.map(content => (
            <div className={styles.postSection} key={content.heading}>
              <h1>{content.heading}</h1>
              {content.body.map(bodyContent => (
                <p key={bodyContent.text}>{bodyContent.text}</p>
              ))}
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = client;
  const posts = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = client;
  const response = await prismic.getByUID('posts', slug as string, {});
  return {
    props: {
      post: response,
    },
  };
};
