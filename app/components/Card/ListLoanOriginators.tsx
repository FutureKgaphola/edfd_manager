import { customsubmitTheme } from "@/app/SiteTheme/Theme";
import { Button, Card } from "flowbite-react";
import Image from "next/image";
import user from '../../assets/images/user.png';
import axios from "axios";
import { failureMessage, successMessage } from "@/app/notifications/successError";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { OriginatorSliceAction } from "@/lib/features/assignOriginator/originator";
import { DistrictDataSliceAction } from "@/lib/features/DistrictApplications/districtSlice";
import useOriginators from "@/app/hooks/useOriginators";
import { useEffect, useState } from "react";
import { getDistrict } from "@/app/services/Find_district_by_id";

export function ListLoanOriginators() {
  const Rowprop = useSelector((state: RootState) => state.OriginatorSliceReducer);
  const magerData = useSelector((state: RootState) => state.AuthReducer);
  const distData = useSelector((state: RootState) => state.DistrictDataSliceReducer);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [shouldFetchOriginators, setShouldFetchOriginators] = useState(false);
  const [foundDistrict,SetfoundDistrict]=useState("");
  const id = Rowprop.slectedApplication_Row?.id ?? null;
  const managerId = magerData?.user?.id ?? null;
  const districtId = distData?.TableData[0]?.districtId ?? null;

  const { data, isLoading } = useOriginators(districtId ?? '', {
    enabled: shouldFetchOriginators && !!districtId, // conditionally enable
  });

  const AssignLoanOriginator = async (item: any) => {
    try {
      const resp = await axios.patch(`/api/applications/assign`, {
        empno: item.empno,
        id,
        managerId: managerId?.toString(),
      });

      if (resp.status === 200) {
        successMessage(resp.data.message);
        queryClient.invalidateQueries({ queryKey: ["applications"] });

        dispatch(OriginatorSliceAction.PoupUpModal_Originators({
          isShowList: false,
          slectedApplication_Row: {
            amount: '', applicationRef: '', companyName: '', create_date: '', districtId: '',
            empno: '', id: '', last_update: '', loanDocs: '', message: '', outcome: '',
            regNo: '', stageAt: '', status: '', user_email: ''
          }
        }));

        dispatch(DistrictDataSliceAction.PopulateTable({ isShowTable: false, TableData: [] }));
      } else {
        failureMessage(resp.data.message);
        console.error("Error assigning Loan Originator", resp);
      }
    } catch (error) {
      console.log(error);
      failureMessage("Failed to assign loan originator");
    }
  };
  useEffect(() => {
  const fetchDistrict = async () => {
    if (districtId) {
      const district = await getDistrict(districtId);
      SetfoundDistrict(district);
    }
  };
  fetchDistrict();
}, [districtId]);

  useEffect(() => {
    if (Rowprop?.isShowList) {
      setShouldFetchOriginators(true); // Trigger fetch only when popup is shown
    }
  }, [Rowprop?.isShowList]);

  if (!shouldFetchOriginators) return null;

  if (isLoading) {
    return (
      <Card className="max-w-sm">
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm">
      <div className="mb-4 flex flex-col items-center justify-between">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Loan Originators</h5>
        <p className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-500">
          {foundDistrict} District
        </p>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {data?.originators?.map((item: any) => (
            <li key={item?.id} className="py-3 border-[0.1px] p-1 rounded sm:py-4">
              <div className="flex items-center space-x-4">
                <div className="shrink-0">
                  <Image
                    alt="Originator image"
                    height="32"
                    src={user}
                    width="32"
                    className="rounded-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.fullnames}</p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{item.empno}</p>
                </div>
                <Button onClick={() => AssignLoanOriginator(item)} theme={customsubmitTheme} color="success" size="xs">Assign</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
