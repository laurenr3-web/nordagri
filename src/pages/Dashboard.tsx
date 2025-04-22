import React from "react";
import MainLayout from "@/ui/layouts/MainLayout";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="w-full max-w-screen-xl mx-auto px-6 lg:px-12" style={{ overflowX: "hidden" }}>
        <h1 className="text-2xl font-semibold mb-6">{t("dashboard.title")}</h1>
      </div>
    </MainLayout>
  );
};
export default Dashboard;
