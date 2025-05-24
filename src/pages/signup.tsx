import { SignUpPageTemplate } from "@/components";
import Head from "next/head";

const signup = () => {
  return (
    <div>
      <Head>
        <title>Sign up - TS Code</title>
      </Head>
      <SignUpPageTemplate />
    </div>
  );
};

export default signup;
