"use client"
import { Alert } from "flowbite-react";
import { Nav_bar } from "../components/Navbar";
import { Suspense, useEffect, useState } from "react";
import { ApplicationsTable } from "../components/Tables/Applications";
import { OriginatorsModal } from "../components/Modal/OriginatorsModal";
import Sekhukhune from "../components/Card/Districts/Sekhukhune";
import Capricorn from "../components/Card/Districts/Capricorn";
import Mopani from "../components/Card/Districts/Mopani";
import Vhembe from "../components/Card/Districts/Vhembe";
import Waterberg from "../components/Card/Districts/Waterberg";
import useApplications from "../hooks/useApplications";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { withAuth } from "@/lib/withAuth";

const Dashboard = () => {
  const districtprop = useSelector((state: RootState) => state.DistrictDataSliceReducer);
  const Authprop = useSelector((state: RootState) => state.AuthReducer);
  const { data, isLoading } = useApplications();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);
  return (
    <>
      {hydrated && (
        <main>
          <Nav_bar />
          <div className=" p-4">

            <div className="mb-5 flex -top-11 items-center justify-center">
              <div className="bg-slate-50 p-4 rounded-md place-self-center mt-4">
                <Alert color="green" className="mb-2">
                  <span className="font-medium">Hey. Nice to see you again.!</span> Manager, <span className="bg-slate-50 p-1 rounded">{(Authprop?.user?.first_name + " " + Authprop?.user?.last_name)}</span>
                  {hydrated && <p>Preparing your profile .....</p>}
                </Alert>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Suspense fallback={<div className="w-full h-96 flex items-center justify-center"><p className="text-lg">Loading Districts...</p></div>}>
                    <Capricorn data={data?.Capricorn || []} isLoading={isLoading} />
                    <Sekhukhune data={data?.Sekhukhune || []} isLoading={isLoading} />
                    <Mopani data={data?.Mopani || []} isLoading={isLoading} />
                    <Vhembe data={data?.Vhembe || []} isLoading={isLoading} />
                    <Waterberg data={data?.Waterberg || []} isLoading={isLoading} />
                  </Suspense>
                </div>
                <p className="font-poppinsLight text-sm text-center mt-2">Copyright © 2025 Limpopo Connexion. All rights reserved.</p>
              </div>

            </div>
            {hydrated && districtprop?.isShowTable ? (<ApplicationsTable data={districtprop?.TableData} />) : null}
            <OriginatorsModal />
          </div>
        </main>
      )}

    </>
  );
}

export default withAuth(Dashboard);