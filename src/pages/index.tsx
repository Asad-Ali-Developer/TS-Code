import { HomePageTemplate } from "@/components";
import Head from "next/head";

const index = () => {
  return (
    <div>
      <Head>
        <title>TS Code</title>
      </Head>
      <HomePageTemplate />
    </div>
  );
};

export default index;
