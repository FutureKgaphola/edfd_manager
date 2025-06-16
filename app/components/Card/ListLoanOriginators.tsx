
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

export function ListLoanOriginators() {

const Rowprop = useSelector((state: RootState) => state.OriginatorSliceReducer);
let id: string | null = null;
let districtId: string | null = null;
let managerId: string | null = null;
const dispatch = useDispatch();
const magerData = useSelector((state: RootState) => state.AuthReducer);

if (magerData?.user?.id !== null) {
  managerId = magerData?.user?.id ?? null;
}

const distData = useSelector((state: RootState) => state.DistrictDataSliceReducer);
if(distData?.TableData[0]?.districtId!== null){
  districtId = distData?.TableData[0]?.districtId ?? null;
}
const {data,isLoading}=useOriginators(districtId ?? ''); // Fetch originators based on districtId

if(Rowprop.slectedApplication_Row!== null){
  id = Rowprop.slectedApplication_Row?.id ?? null;
}
const queryClient = useQueryClient();

  const AssignLoanOriginator = async (item: any) => {
    try {
      const resp = await axios.patch(`/api/applications/assign`, {
        empno: item.empno,
        id: id, // Application ID to assign the originator to
        managerId: managerId?.toString(), // Manager ID from the logged-in user
      })

      if (resp.status === 200) {
        successMessage(resp.data.message);
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        dispatch(OriginatorSliceAction.PoupUpModal_Originators({ isShowList:false,slectedApplication_Row:{amount:'',applicationRef:'',companyName:'',create_date:'',districtId:'',empno:'',id:'',last_update:'',loanDocs:'',message:'',outcome:'',regNo:'',stageAt:'',status:'',user_email:''} }))
        dispatch(DistrictDataSliceAction.PopulateTable({ isShowTable: false, TableData:[] }))
        console.log("Loan Originator Assigned Successfully");
      } else {
        failureMessage(resp.data.message);
        console.error("Error assigning Loan Originator", resp);
      }
    } catch (error) {
      console.log(error);
      failureMessage("Failed to assign loan originator");
    }
  }
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
          Mopani District
        </p>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {
            data?.originators?.map((item:any) => (
              <li key={item?.id} className="py-3 sm:py-4">
                <div className="flex items-center space-x-4">
                  <div className="shrink-0">
                    <Image
                      alt="Neil image"
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
            ))
          }
        </ul>
      </div>
    </Card>
  );
}
