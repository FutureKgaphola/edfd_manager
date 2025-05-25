
"use client";

import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import {  useState } from "react";
import { ListLoanOriginators } from "../Card/ListLoanOriginators";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { OriginatorSliceAction } from "@/lib/features/assignOriginator/originator";

export function OriginatorsModal() {
  const Rowprop = useSelector((state: RootState) => state.OriginatorSliceReducer);
  const dispatch = useDispatch();
  const [modalSize, setModalSize] = useState<string>("lg");

  return (
    <>
      <Modal show={Rowprop.isShowList} size={modalSize} onClose={() =>dispatch(OriginatorSliceAction.PoupUpModal_Originators({ isShowList:false,slectedApplication_Row:{amount:'',applicationRef:'',companyName:'',create_date:'',districtId:'',empno:'',id:'',last_update:'',loanDocs:'',message:'',outcome:'',regNo:'',stageAt:'',status:'',user_email:''} }))}>
        <ModalHeader>Loan Originators</ModalHeader>
        <ModalBody>
          <div className="space-y-6 p-6">
            <ListLoanOriginators/>
          </div>
        </ModalBody>
        
      </Modal>
    </>
  );
}
