import { Client_Details } from "@/app/components/client-details";
import { Clinet_Table } from "@/app/components/client-table";

interface PageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clientId } = await params;
  
  return (
    <div className="flex flex-col gap-10 pl-[42px] pr-[75px] pt-[42px] pb-[90px]">
      <Clinet_Table clientID={clientId} />
      <Client_Details />
    </div>
  );
}