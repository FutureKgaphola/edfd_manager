import { createSlice } from "@reduxjs/toolkit";

const initialState={
    isShowTable:false,
    TableData:[]
}
const DistrictDataSlice=createSlice({
    name:"listApplications",
    initialState:initialState,
    reducers:{
        PopulateTable:(state,action)=>{
            const { isShowTable,TableData } = action.payload;
            state.isShowTable=isShowTable;
            state.TableData=TableData;
        }
    }
});

export const DistrictDataSliceReducer=DistrictDataSlice.reducer;
export const DistrictDataSliceAction=DistrictDataSlice.actions;