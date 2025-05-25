import { DashboardPageTemplate } from "@/components";
import Head from "next/head";

const dashboard = () => {
  return (
    <div>
      <Head>
        <title>Dashboard - TS Code</title>
      </Head>
      <DashboardPageTemplate />
    </div>
  );
};

export default dashboard;
