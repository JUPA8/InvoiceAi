import { fetchData } from "@/app/actions/fetching";
import { Clients } from "@/app/components/clients";
import React from "react";

export default async function Login() {
  const data = await fetchData("get", "/api/v1/Clients");
  // const getClients = async () => {
  //   try {
  //     const clients = await fetchData("get", "/api/v1/Clients");
  //     data = clients;
  //   } catch (error) {
  //     console.error("Failed to fetch clients:", error);
  //   }
  // };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 relative">
      <Clients clients={data} />
    </main>
  );
}
