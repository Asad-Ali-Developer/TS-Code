import { SignInPageTemplate } from "@/components";
import Head from "next/head";

const signin = () => {
  return (
    <div>
      <Head>
        <title>Sign in - TS Code</title>
      </Head>
      <SignInPageTemplate />
    </div>
  );
};

export default signin;
