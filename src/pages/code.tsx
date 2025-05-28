import { CodeEditorPageTemplate } from "@/components";
import Head from "next/head";

const code = () => {
  return (
    <div>
      <Head>
        <title>Code - TS Code</title>
      </Head>
      {/* Xode Editor */}
      <CodeEditorPageTemplate />
    </div>
  );
};

export default code;
