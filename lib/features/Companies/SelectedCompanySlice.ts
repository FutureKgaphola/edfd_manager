import { createSlice } from "@reduxjs/toolkit";

const initialState={
    regNo:"",
    loanCat_id:"0"
}
const SelectedCompanySlice=createSlice({
    name:"selectedcompNloanType",
    initialState:initialState,
    reducers:{
        SetGlobalselectedcompReg:(state,action)=>{
            const { regNo} = action.payload;
            state.regNo=regNo;
        },
        SetGlobalselectedcompLoanType:(state,action)=>{
            const { loanCat_id } = action.payload;
            state.loanCat_id=loanCat_id;
        }
    }
});

export const SelectedCompanyReducer=SelectedCompanySlice.reducer;
export const SelectedCompanyAction=SelectedCompanySlice.actions;