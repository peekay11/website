import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SignupForm from '@site/src/components/signup-form'
import CodeBlock from '@theme/CodeBlock';

const features = [
  {
    title: <>From idea to app in minutes</>,
    imageUrl: 'img/pages/home/feature-bolt.svg',
    description: (
      <>
        An internal tool or a dashboard for your team, weekend project, data entry form, kiosk app or high-fidelity prototype
        - Flet is an ideal framework to quickly hack together a great-looking interactive app to serve a group of users.
      </>
    ),
  },
  {
    title: <>Simple architecture</>,
    imageUrl: 'img/pages/home/feature-house.svg',
    description: (
      <>
        No more complex architecture with JavaScript frontend, REST API backend, database, cache, etc.
        With Flet you just write a monolithic stateful app in Python and get a multi-user, realtime Single-Page Application (SPA).
      </>
    ),
  },
  {
    title: <>Batteries included</>,
    imageUrl: 'img/pages/home/feature-battery.svg',
    description: (
      <>
        To start developing with Flet, all you need is your favorite IDE or text editor.
        No SDKs or thousands of dependencies, no complex tooling - Flet has a built-in web server with assets hosting and desktop clients.
      </>
    ),
  },
  {
    title: <>Powered by Flutter</>,
    imageUrl: 'img/pages/home/feature-flutter.svg',
    description: (
      <>
        Flet UI is built with <a href="https://flutter.dev">Flutter</a>, so your app looks professional and can be delivered to any platform.
        Flet simplifies Flutter's model by combining smaller "widgets" into ready-to-use "controls" with an imperative programming model.
      </>
    ),
  },
  {
    title: <>Build your entire app in one language</>,
    imageUrl: 'img/pages/home/feature-python.svg',
    description: (
      <>
        Leverage your mastery of a single, well-loved langauge, Python. No need to rely on an incomplete understanding of the features of several other languages like Kotlin, Swift, javascript, etc.
      </>
    ),
  },
  {
    title: <>Deliver to any device</>,
    imageUrl: 'img/pages/home/feature-mobile.svg',
    description: (
      <>
        Deploy Flet app as a web app and view it in a browser. Package it as a standalone desktop app for Windows, macOS and Linux.
        Install it on mobile as <a href="https://web.dev/what-are-pwas/">PWA</a> or view via Flet app for iOS and Android.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`${siteConfig.customFields.heroTitle}`}
      description={`${siteConfig.tagline}`}>
      <main>
        <div className="container margin-bottom--lg">
          <div className={clsx('flet-hero', styles.heroBanner)}>
            <div className="row">
              <div className="col  col--6">
                {/* <h2>It's amazing how little code you need to get amazing results!</h2> */}
                <img src="img/pages/home/flet-home.png" style={{ width: '100%' }}></img>
              </div>
              <div className="col col--6">
                <h1 className="hero__title">{siteConfig.customFields.heroTitle}</h1>
                <p className="hero__subtitle">{siteConfig.customFields.heroSubTitle}</p>
                <div className={styles.buttons}>
                  <Link
                    className={styles.indexCtasGetStartedButton}
                    to={'https://docs.flet-docs.pages.dev/'}>
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container text--center">
          <h2>Main features</h2>
          {features && features.length > 0 && (
            <section className={styles.features}>
              <div className="container">
                <div className="row">
                  {features.map((props, idx) => (
                    <Feature key={idx} {...props} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
        <SignupForm />
      </main>
    </Layout>
  );
}

export default Home;